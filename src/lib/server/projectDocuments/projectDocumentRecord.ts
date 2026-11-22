import type { GrantedUpload } from '$lib/server/storage/recordArrivedUpload';
import type { ProjectDocument } from '$lib/projectDocuments/projectDocument';

/** The columns a kept document is read with: everything but its text, which is read only when the document is opened. */
export const projectDocumentColumns =
	'id, project_id, title, summary, section, position, filename, mime_type, byte_count, storage_path, added_by, recorded_at';

/** The columns a granted upload is read with, whether or not its file has arrived. */
export const documentUploadColumns = 'id, storage_path, expires_at, recorded_at';

/** A kept document from its row. */
export function parseProjectDocument(row: Record<string, unknown>): ProjectDocument {
	const storagePath = (row.storage_path as string | null) ?? null;
	return {
		id: row.id as string,
		projectId: row.project_id as string,
		title: row.title as string,
		summary: row.summary as string,
		section: row.section as string,
		position: row.position as number,
		filename: row.filename as string,
		mimeType: row.mime_type as string,
		byteCount: row.byte_count as number,
		isWritten: storagePath === null,
		storagePath,
		addedBy: (row.added_by as string | null) ?? null,
		recordedAt: row.recorded_at as string
	};
}

/** The upload granted for a document's file, from its row. */
export function parseDocumentUpload(row: Record<string, unknown>): GrantedUpload {
	return {
		id: row.id as string,
		storagePath: row.storage_path as string,
		expiresAt: row.expires_at as string,
		recordedAt: (row.recorded_at as string | null) ?? null
	};
}
