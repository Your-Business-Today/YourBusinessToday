import type { SupabaseClient } from '@supabase/supabase-js';
import { attachmentStoragePath } from './attachmentStorage';
import { isFileStored } from './storageUploads';
import { saveAttachmentRecord } from './saveAttachmentRecord';
import type { AttachmentUpload } from './attachmentRecord';

export type AttachmentRecording = 'recorded' | 'file_missing';

export const attachmentRecordings = { recorded: 'recorded', fileMissing: 'file_missing' } as const;

export async function recordTaskAttachment(
	supabase: SupabaseClient,
	taskId: string,
	attachmentId: string,
	uploadedBy: string,
	upload: AttachmentUpload
): Promise<AttachmentRecording> {
	const storagePath = attachmentStoragePath(taskId, attachmentId, upload.filename);
	if (!(await isFileStored(supabase, storagePath))) return 'file_missing';
	await saveAttachmentRecord(supabase, { attachmentId, taskId, uploadedBy, storagePath, upload });
	return 'recorded';
}
