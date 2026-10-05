import type { StoredFile } from '$lib/server/projects/attachmentRecord';

export type ProjectImage = StoredFile & {
	projectId: string;
	uploadedBy: string;
	createdAt: string;
};

export function parseProjectImageRecord(row: Record<string, unknown>): ProjectImage {
	return {
		id: row.id as string,
		projectId: row.project_id as string,
		filename: row.filename as string,
		mimeType: row.mime_type as string,
		byteCount: Number(row.byte_count),
		storagePath: row.storage_path as string,
		uploadedBy: row.uploaded_by as string,
		createdAt: row.created_at as string
	};
}
