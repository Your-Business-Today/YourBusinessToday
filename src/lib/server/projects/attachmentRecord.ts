export type AttachmentUpload = {
	filename: string;
	mimeType: string;
	byteCount: number;
};

export type StoredFile = AttachmentUpload & {
	id: string;
	storagePath: string;
};

export type TaskAttachment = StoredFile & {
	taskId: string;
	uploadedBy: string;
	createdAt: string;
};

export function parseAttachmentRecord(row: Record<string, unknown>): TaskAttachment {
	return {
		id: row.id as string,
		taskId: row.task_id as string,
		filename: row.filename as string,
		mimeType: row.mime_type as string,
		byteCount: Number(row.byte_count),
		storagePath: row.storage_path as string,
		uploadedBy: row.uploaded_by as string,
		createdAt: row.created_at as string
	};
}
