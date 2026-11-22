import type { DocumentDetails } from './projectDocument';

/** One section of a project's documents: its name and its documents in the order they are listed. */
export type DocumentSection<Document> = { name: string; documents: Document[] };

type Placed = Pick<DocumentDetails, 'section' | 'position' | 'title'>;

/** The documents grouped into their sections: each section in the order of its first document, each document by its position. */
export function documentSectionsOf<Document extends Placed>(documents: Document[]): DocumentSection<Document>[] {
	const sections: DocumentSection<Document>[] = [];
	for (const document of [...documents].sort(byPlaceInList)) placeInSection(sections, document);
	return sections;
}

function placeInSection<Document extends Placed>(sections: DocumentSection<Document>[], document: Document): void {
	const section = sections.find((candidate) => candidate.name === document.section);
	if (section !== undefined) return void section.documents.push(document);
	sections.push({ name: document.section, documents: [document] });
}

function byPlaceInList(left: Placed, right: Placed): number {
	if (left.position !== right.position) return left.position - right.position;
	return left.title.localeCompare(right.title);
}
