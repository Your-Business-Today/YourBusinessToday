import { entitiesInContext, type BoundedContext, type DomainEntity, type DomainModel } from './domainModel';

type Box = { x: number; y: number; width: number; height: number };

export type PlacedEntity = Box & { name: string; title: string; entity: DomainEntity; isNested: boolean };

export type PlacedContext = Box & { name: string; title: string; fullTitle: string; context: BoundedContext };

export type DomainLayout = { contexts: PlacedContext[]; entities: PlacedEntity[]; width: number; height: number };

export const domainLayoutSizes = {
	columns: 3,
	contextWidth: 250,
	gap: 40,
	heading: 36,
	row: 30,
	padding: 10,
	nesting: 16
} as const;

const sizes = domainLayoutSizes;

/** The contexts laid out as boxes in columns, each dropped into the shortest column, their entities listed inside. */
export function layOutDomain(domain: DomainModel): DomainLayout {
	const columnHeights: number[] = Array.from({ length: sizes.columns }, () => 0);
	const contexts: PlacedContext[] = [];
	const entities: PlacedEntity[] = [];
	for (const context of domain.contexts) {
		const column = columnHeights.indexOf(Math.min(...columnHeights));
		const placed = placeContext(context, column, columnHeights[column]);
		contexts.push(placed);
		entities.push(...placeEntities(placed));
		columnHeights[column] += placed.height + sizes.gap;
	}
	const width = sizes.columns * sizes.contextWidth + (sizes.columns + 1) * sizes.gap;
	return { contexts, entities, width, height: Math.max(...columnHeights) + sizes.gap };
}

function placeContext(context: BoundedContext, column: number, top: number): PlacedContext {
	const entityCount = entitiesInContext(context).length;
	const height = sizes.heading + entityCount * sizes.row + sizes.padding;
	const x = sizes.gap + column * (sizes.contextWidth + sizes.gap);
	const box = { x, y: top + sizes.gap, width: sizes.contextWidth, height };
	return { ...box, name: context.name, title: shortenedTitle(context.title), fullTitle: context.title, context };
}

function placeEntities(placed: PlacedContext): PlacedEntity[] {
	const members = entitiesInContext(placed.context);
	return members.map((entity, index) => {
		const isNested = entity.name !== entity.aggregateRootName;
		const indent = isNested ? sizes.nesting : 0;
		return {
			name: entity.name,
			title: entity.title,
			entity,
			x: placed.x + sizes.padding + indent,
			y: placed.y + sizes.heading + index * sizes.row,
			width: placed.width - 2 * sizes.padding - indent,
			height: sizes.row - 6,
			isNested
		};
	});
}

const longestTitle = 34;
const ellipsis = '…';

/** A context's title cut to fit across the top of its box. */
function shortenedTitle(title: string): string {
	if (title.length <= longestTitle) return title;
	return `${title.slice(0, longestTitle - 1).trimEnd()}${ellipsis}`;
}
