import type { SupabaseClient } from '@supabase/supabase-js';
import { attachmentsBucket, attachmentStoragePath } from './attachmentStorage';

export type AttachmentUploadGrant = {
	attachmentId: string;
	storagePath: string;
	uploadUrl: string;
};

export async function grantAttachmentUpload(
	supabase: SupabaseClient,
	taskId: string,
	filename: string
): Promise<AttachmentUploadGrant> {
	const attachmentId = crypto.randomUUID();
	const storagePath = attachmentStoragePath(taskId, attachmentId, filename);
	const { data, error } = await supabase.storage
		.from(attachmentsBucket)
		.createSignedUploadUrl(storagePath);
	if (error !== null) throw error;
	return { attachmentId, storagePath, uploadUrl: data.signedUrl };
}
