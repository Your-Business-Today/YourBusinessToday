import type { SupabaseClient } from '@supabase/supabase-js';
import { attachmentsBucket } from './attachmentStorage';
import type { StoredFile } from './attachmentRecord';
import { attachmentLinkKinds, type AttachmentLinkKind } from '$lib/data/attachmentLinkKind';

export type { AttachmentLinkKind };

export const clickThroughLifetimeSeconds = 60;
export const agentFetchLifetimeSeconds = 10 * 60;

export async function signAttachmentLink(
	supabase: SupabaseClient,
	attachment: StoredFile,
	kind: AttachmentLinkKind,
	lifetimeSeconds: number
): Promise<string> {
	const { data, error } = await supabase.storage
		.from(attachmentsBucket)
		.createSignedUrl(attachment.storagePath, lifetimeSeconds, signingOptions(attachment, kind));
	if (error !== null) throw error;
	return data.signedUrl;
}

function signingOptions(
	attachment: StoredFile,
	kind: AttachmentLinkKind
): { download?: string } {
	if (kind === attachmentLinkKinds.open) return {};
	return { download: attachment.filename };
}
