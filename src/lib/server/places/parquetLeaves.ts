import type { ColumnChunk, FileMetaData, SchemaElement } from 'hyparquet';

const pathSeparator = '.';

type KeptElements = { elements: SchemaElement[]; keptCount: number; next: number };

/** A column chunk's leaf by its path: the names from the top column down to the leaf, joined by dots. */
export function leafPathOf(chunk: ColumnChunk): string {
	const { meta_data: facts } = chunk;
	return facts === undefined ? '' : facts.path_in_schema.join(pathSeparator);
}

/** The top-level columns the leaves belong to, each once: what a reader is asked for by name. */
export function columnsOfLeaves(leaves: string[]): string[] {
	return [...new Set(leaves.map((leaf) => leaf.split(pathSeparator)[0]))];
}

/**
 * The footer narrowed to the leaves asked for, so a reader fetches and builds nothing else: a places file carries some
 * fifty leaves, and building them all for one row group takes several times the memory of the dozen a premises needs.
 * A leaf the file does not carry is refused by name, because rows read without it would look empty, not wrong.
 */
export function keepOnlyLeaves(metadata: FileMetaData, leaves: string[]): FileMetaData {
	refuseLeavesNotCarried(metadata, leaves);
	const wanted = new Set(leaves);
	const [root] = metadata.schema;
	const beneathRoot = keptBeneath(metadata.schema, 1, root.num_children ?? 0, [], wanted);
	const schema = [{ ...root, num_children: beneathRoot.keptCount }, ...beneathRoot.elements];
	const row_groups = metadata.row_groups.map((group) => ({ ...group, columns: group.columns.filter((chunk) => wanted.has(leafPathOf(chunk))) }));
	return { ...metadata, schema, row_groups };
}

function refuseLeavesNotCarried(metadata: FileMetaData, leaves: string[]): void {
	const [firstGroup] = metadata.row_groups;
	if (firstGroup === undefined) return;
	const carried = new Set(firstGroup.columns.map(leafPathOf));
	const missing = leaves.filter((leaf) => !carried.has(leaf));
	if (missing.length === 0) return;
	const namesMissing = missing.join(', ');
	throw new Error(`The file carries no column ${namesMissing}: its layout has changed`);
}

/** The schema is a flat list, each group followed by everything beneath it: the children from `first` that are kept, and where the next sibling starts. */
function keptBeneath(schema: SchemaElement[], first: number, childCount: number, pathAbove: string[], wanted: Set<string>): KeptElements {
	const elements: SchemaElement[] = [];
	let keptCount = 0;
	let next = first;
	for (let child = 0; child < childCount; child += 1) {
		const kept = keptFrom(schema, next, pathAbove, wanted);
		next = kept.next;
		keptCount += kept.keptCount;
		for (const element of kept.elements) elements.push(element);
	}
	return { elements, keptCount, next };
}

/** One element with what is kept beneath it: a leaf when it was asked for, a group when anything beneath it was. */
function keptFrom(schema: SchemaElement[], index: number, pathAbove: string[], wanted: Set<string>): KeptElements {
	const element = schema[index];
	const path = [...pathAbove, element.name];
	const childCount = element.num_children ?? 0;
	const beneath = keptBeneath(schema, index + 1, childCount, path, wanted);
	const isLeafWanted = childCount === 0 && wanted.has(path.join(pathSeparator));
	const isKept = isLeafWanted || beneath.keptCount > 0;
	if (!isKept) return { elements: [], keptCount: 0, next: beneath.next };
	const kept = childCount === 0 ? element : { ...element, num_children: beneath.keptCount };
	return { elements: [kept, ...beneath.elements], keptCount: 1, next: beneath.next };
}
