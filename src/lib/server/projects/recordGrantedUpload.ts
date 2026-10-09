import type { SupabaseClient } from '@supabase/supabase-js';
import { claimTaskUploadGrant } from './claimTaskUploadGrant';
import { measureStoredFile } from './measureStoredFile';
import { removeAttachmentFiles } from './attachmentFiles';
import { saveAttachmentRecord } from './saveAttachmentRecord';
import { uploadGrantStanding, uploadGrantStandings, type TaskUploadGrant } from './uploadGrantRecord';

export type GrantedUploadRecording =
	| { status: 'recorded'; byteCount: number }
	| { status: 'file_missing' }
	| { status: 'expired' }
	| { status: 'used' };

export const uploadRecordingStatuses = {
	recorded: 'recorded',
	fileMissing: 'file_missing',
	expired: 'expired',
	used: 'used'
} as const;

/** Turn the file sent to a grant's link into the task's attachment, once, while the link is live. */
export async function recordGrantedUpload(
	supabase: SupabaseClient,
	grant: TaskUploadGrant
): Promise<GrantedUploadRecording> {
	const standing = uploadGrantStanding(grant, new Date());
	if (standing === uploadGrantStandings.used) return { status: 'used' };
	if (standing === uploadGrantStandings.expired) return expireWithFile(supabase, grant);
	const byteCount = await measureStoredFile(supabase, grant.storagePath);
	if (byteCount === null) return { status: 'file_missing' };
	const isClaimed = await claimTaskUploadGrant(supabase, grant.id);
	if (!isClaimed) return { status: 'used' };
	await saveAttachmentRecord(supabase, {
		attachmentId: grant.id,
		taskId: grant.taskId,
		uploadedBy: grant.grantedTo,
		storagePath: grant.storagePath,
		upload: { filename: grant.filename, mimeType: grant.mimeType, byteCount }
	});
	return { status: 'recorded', byteCount };
}

async function expireWithFile(
	supabase: SupabaseClient,
	grant: TaskUploadGrant
): Promise<GrantedUploadRecording> {
	await removeAttachmentFiles(supabase, [grant.storagePath]);
	return { status: 'expired' };
}
