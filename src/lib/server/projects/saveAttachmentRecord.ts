import type { SupabaseClient } from '@supabase/supabase-js';
import type { AttachmentUpload } from './attachmentRecord';

export type NewAttachmentRecord = {
	attachmentId: string;
	taskId: string;
	uploadedBy: string;
	storagePath: string;
	upload: AttachmentUpload;
};

export async function saveAttachmentRecord(
	supabase: SupabaseClient,
	record: NewAttachmentRecord
): Promise<void> {
	const { upload } = record;
	const { error } = await supabase.from('task_attachments').insert({
		id: record.attachmentId,
		task_id: record.taskId,
		filename: upload.filename,
		mime_type: upload.mimeType,
		byte_count: upload.byteCount,
		storage_path: record.storagePath,
		uploaded_by: record.uploadedBy
	});
	if (error !== null) throw error;
}
