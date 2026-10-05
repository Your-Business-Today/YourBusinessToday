import type { SupabaseClient } from '@supabase/supabase-js';
import { attachmentStoragePath } from './attachmentStorage';
import { signUploadUrl } from './storageUploads';

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
	return { attachmentId, storagePath, uploadUrl: await signUploadUrl(supabase, storagePath) };
}
