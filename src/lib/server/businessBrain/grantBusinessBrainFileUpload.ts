import type { SupabaseClient } from '@supabase/supabase-js';
import { businessBrainFilesBucket, businessBrainFileStoragePath } from './businessBrainFileStorage';
import { businessBrainUploadLinkLifetimeHours, type BusinessBrainFileGiven } from '$lib/data/businessBrainFileRules';

/** The link a source file is sent to, and the id it is kept under once it arrives. */
export type GrantedBusinessBrainUpload = { fileId: string; uploadUrl: string; expiresAt: string };

const millisecondsInAnHour = 60 * 60 * 1000;

/** Opens a signed upload link for one file into the organisation's brain, kept under the person who asked for it. */
export async function grantBusinessBrainFileUpload(
	supabase: SupabaseClient,
	sender: { organisationId: string; accountId: string },
	file: BusinessBrainFileGiven
): Promise<GrantedBusinessBrainUpload> {
	const fileId = crypto.randomUUID();
	const storagePath = businessBrainFileStoragePath(sender.organisationId, fileId, file.filename);
	const { data: signed, error: signingError } = await supabase.storage.from(businessBrainFilesBucket).createSignedUploadUrl(storagePath);
	if (signingError !== null) throw signingError;
	const expiresAt = new Date(Date.now() + businessBrainUploadLinkLifetimeHours * millisecondsInAnHour).toISOString();
	const row = {
		id: fileId,
		organisation_id: sender.organisationId,
		filename: file.filename,
		mime_type: file.mimeType,
		storage_path: storagePath,
		sent_by: sender.accountId,
		expires_at: expiresAt
	};
	const { error } = await supabase.from('business_brain_files').insert(row);
	if (error !== null) throw error;
	return { fileId, uploadUrl: signed.signedUrl, expiresAt };
}
