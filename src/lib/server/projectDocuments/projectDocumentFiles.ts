import { safeStorageFilename } from '$lib/server/storage/safeStorageFilename';

/** The private bucket a project's document files are kept in (migration 0268). */
export const projectDocumentBucket = 'project-documents';

/** Where a project's document files are kept, and the table each one is granted under. */
export const projectDocumentHome = { bucket: projectDocumentBucket, table: 'project_documents' } as const;

const markdownExtension = '.md';

/** Where a document's file is kept: under its project and its own id, so a project's documents sit together. */
export function documentFilePath(projectId: string, documentId: string, filename: string): string {
	return `${projectId}/${documentId}/${safeStorageFilename(filename)}`;
}

/** The name a written document downloads under: its title, as a Markdown file. */
export function writtenDocumentFilename(title: string): string {
	const words = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
	return `${words === '' ? 'document' : words}${markdownExtension}`;
}
