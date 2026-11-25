import type { DocumentVersion } from '$lib/projectDocuments/documentVersion';
import type { GrantedUpload } from '$lib/server/storage/recordArrivedUpload';

/** The columns a kept version is read with: everything but its text, which is read only when the version is opened. */
export const documentVersionColumns = 'id, document_id, version_number, filename, mime_type, byte_count, storage_path, added_by, recorded_at';

/** The columns a version's granted upload is read with. */
export const versionUploadColumns = 'id, storage_path, expires_at, recorded_at';

/** A kept version from its row. */
export function parseDocumentVersion(row: Record<string, unknown>): DocumentVersion {
	const storagePath = (row.storage_path as string | null) ?? null;
	return {
		id: row.id as string,
		documentId: row.document_id as string,
		versionNumber: row.version_number as number,
		filename: row.filename as string,
		mimeType: row.mime_type as string,
		byteCount: row.byte_count as number,
		isWritten: storagePath === null,
		storagePath,
		addedBy: (row.added_by as string | null) ?? null,
		recordedAt: row.recorded_at as string
	};
}

/** The upload granted for a version's file, from its row. */
export function parseVersionUpload(row: Record<string, unknown>): GrantedUpload {
	return {
		id: row.id as string,
		storagePath: row.storage_path as string,
		expiresAt: row.expires_at as string,
		recordedAt: (row.recorded_at as string | null) ?? null
	};
}
