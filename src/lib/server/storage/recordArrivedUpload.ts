import type { SupabaseClient } from '@supabase/supabase-js';
import { claimArrivedFile } from './claimArrivedFile';
import { hasExpired } from '$lib/data/expiry';
import { measureStoredFile } from './measureStoredFile';

/** What recording a granted file found: it arrived and is kept, it has not arrived yet, its link lapsed unused, or it was kept already. */
export type UploadRecording =
	| { status: 'recorded'; byteCount: number }
	| { status: 'not_arrived' }
	| { status: 'lapsed' }
	| { status: 'already_recorded' };

export const uploadRecordings = {
	recorded: 'recorded',
	notArrived: 'not_arrived',
	lapsed: 'lapsed',
	alreadyRecorded: 'already_recorded'
} as const;

/** Where a granted file is kept: the bucket it is sent to, and the table whose row it was granted under. */
export type UploadHome = { bucket: string; table: string };

/** A granted upload as its row knows it. */
export type GrantedUpload = { id: string; storagePath: string; expiresAt: string; recordedAt: string | null };

/**
 * Keeps the file that arrived at a granted link, at the size that actually arrived. A file that
 * arrived is always kept, however late it is recorded; nothing here deletes one.
 */
export async function recordArrivedUpload(supabase: SupabaseClient, home: UploadHome, upload: GrantedUpload): Promise<UploadRecording> {
	if (upload.recordedAt !== null) return { status: 'already_recorded' };
	const byteCount = await measureStoredFile(supabase, home.bucket, upload.storagePath);
	if (byteCount === null) return hasExpired(upload.expiresAt) ? { status: 'lapsed' } : { status: 'not_arrived' };
	const isClaimed = await claimArrivedFile(supabase, home.table, upload.id, byteCount);
	if (!isClaimed) return { status: 'already_recorded' };
	return { status: 'recorded', byteCount };
}
