import { safeStorageFilename } from '$lib/server/storage/safeStorageFilename';
import { ownerFolderOf, type DocumentOwner } from '$lib/projectDocuments/documentOwner';

/** The private bucket every document's files are kept in, a product's and an organisation's (migrations 0268 and 0281). */
export const projectDocumentBucket = 'project-documents';

/** The table a document's own row is kept in, a product's and an organisation's alike. */
export const documentTable = 'project_documents';

/** The table every kept version of a document is in, and a new version's file waits in. */
export const documentVersionTable = 'project_document_versions';

/** Where a document's first file is kept, and the table it is granted under. */
export const projectDocumentHome = { bucket: projectDocumentBucket, table: documentTable } as const;

/** Where a later version's file is kept, and the table it is granted under. */
export const documentVersionHome = { bucket: projectDocumentBucket, table: documentVersionTable } as const;

const markdownExtension = '.md';

/** Where a document's first file is kept: under its owner and its own id, so an owner's documents sit together. */
export function documentFilePath(owner: DocumentOwner, documentId: string, filename: string): string {
	return `${ownerFolderOf(owner)}/${documentId}/${safeStorageFilename(filename)}`;
}

/** Where a later version's file is kept: beside the first, under its version number. */
export function versionFilePath(owner: DocumentOwner, documentId: string, versionNumber: number, filename: string): string {
	return `${ownerFolderOf(owner)}/${documentId}/versions/${versionNumber}/${safeStorageFilename(filename)}`;
}

/** The name a written document downloads under: its title, as a Markdown file. */
export function writtenDocumentFilename(title: string): string {
	return `${filenameWordsOf(title)}${markdownExtension}`;
}

/** A title as the lower-case words a file is named with, joined by hyphens; "document" when it has none. */
export function filenameWordsOf(title: string): string {
	const words = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
	return words === '' ? 'document' : words;
}
