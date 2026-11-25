import { describeByteCount } from '$lib/data/taskAttachmentRules';
import { documentsPageAddress, type DocumentHome, type ReachedOwner } from './documentHomes';
import { documentShelvesOf, type DocumentShelf } from '$lib/projectDocuments/documentShelves';
import { documentStatusWords } from '$lib/projectDocuments/documentStanding';
import type { DocumentSection } from '$lib/projectDocuments/documentSections';
import type { KeptDocument } from '$lib/projectDocuments/projectDocument';

/** The owner's documents, outputs then inputs, section by section, each with its place, its status, its version, its size and its id. */
export function describeOwnedDocuments(home: DocumentHome, reached: ReachedOwner, documents: KeptDocument[]): string {
	const address = documentsPageAddress(reached.owner);
	const { names } = home;
	if (documents.length === 0) return `${reached.name} has no documents yet. Add one with ${names.add}; they show at ${address}.`;
	const shelves = documentShelvesOf(documents).map(describeShelf);
	return [`# ${reached.name}'s documents, as ${address} shows them:`, ...shelves].join('\n\n');
}

function describeShelf(shelf: DocumentShelf<KeptDocument>): string {
	return [`## ${shelf.heading}`, ...shelf.sections.map(describeSection)].join('\n\n');
}

function describeSection(section: DocumentSection<KeptDocument>): string {
	const lines = section.documents.map((document) => `- ${describeDocumentLine(document)}`);
	return [`### ${section.name}`, ...lines].join('\n');
}

function describeDocumentLine(document: KeptDocument): string {
	const kind = document.isWritten ? 'written in Markdown' : document.mimeType;
	const standing = `${documentStatusWords[document.status]}, version ${document.versionNumber}`;
	return `${document.title} (${standing}, position ${document.position}, ${kind}, ${describeByteCount(document.byteCount)}, document id: ${document.id})`;
}

/** The heading of one document in full: what it is called, where it sits and stands, and what it is about. */
export function describeDocumentHeading(document: KeptDocument): string {
	const summary = document.summary === '' ? 'No summary yet.' : document.summary;
	const standing = `${documentStatusWords[document.status]}, an ${document.flow}, version ${document.versionNumber}`;
	return [`# ${document.title}`, `${standing}. In ${document.section}, position ${document.position}. ${summary}`].join('\n');
}
