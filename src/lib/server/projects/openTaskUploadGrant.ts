import type { SupabaseClient } from '@supabase/supabase-js';
import { grantAttachmentUpload } from './grantAttachmentUpload';
import { uploadLinkLifetimeSeconds } from './uploadGrantRecord';

export type UploadDescription = { filename: string; mimeType: string };

export type OpenedUploadGrant = {
	grantId: string;
	uploadUrl: string;
	expiresAt: string;
};

/** Open a one-time link to send a file to a task, recorded under the person who asked. */
export async function openTaskUploadGrant(
	supabase: SupabaseClient,
	taskId: string,
	grantedTo: string,
	upload: UploadDescription
): Promise<OpenedUploadGrant> {
	const granted = await grantAttachmentUpload(supabase, taskId, upload.filename);
	const expiresAt = new Date(Date.now() + uploadLinkLifetimeSeconds * 1000).toISOString();
	const { error } = await supabase.from('task_upload_grants').insert({
		id: granted.attachmentId,
		task_id: taskId,
		granted_to: grantedTo,
		filename: upload.filename,
		mime_type: upload.mimeType,
		storage_path: granted.storagePath,
		expires_at: expiresAt
	});
	if (error !== null) throw error;
	return { grantId: granted.attachmentId, uploadUrl: granted.uploadUrl, expiresAt };
}
