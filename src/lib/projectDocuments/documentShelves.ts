import { documentFlows, documentFlowWords, type DocumentFlow } from './documentStanding';
import { documentSectionsOf, type DocumentSection } from './documentSections';
import type { DocumentDetails } from './projectDocument';

/** One shelf of an owner's documents: its outputs or its inputs, each in its sections. */
export type DocumentShelf<Document> = { flow: DocumentFlow; heading: string; sections: DocumentSection<Document>[] };

/** The documents put apart into outputs and inputs, outputs first; a shelf with nothing on it is left out. */
export function documentShelvesOf<Document extends Pick<DocumentDetails, 'section' | 'position' | 'title' | 'flow'>>(
	documents: Document[]
): DocumentShelf<Document>[] {
	return documentFlows
		.map((flow) => ({ flow, heading: documentFlowWords[flow], sections: documentSectionsOf(documents.filter((document) => document.flow === flow)) }))
		.filter(({ sections }) => sections.length > 0);
}
