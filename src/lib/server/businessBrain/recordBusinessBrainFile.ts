import type { SupabaseClient } from '@supabase/supabase-js';
import { businessBrainFilesBucket } from './businessBrainFileStorage';
import { hasExpired } from '$lib/data/expiry';
import type { BusinessBrainFile } from './businessBrainFileRecord';

/** What recording a granted file found: it arrived and is kept, it has not arrived yet, its link lapsed unused, or it was kept already. */
export type BusinessBrainFileRecording =
	| { status: 'recorded'; byteCount: number }
	| { status: 'not_arrived' }
	| { status: 'lapsed' }
	| { status: 'already_recorded' };

export const businessBrainFileRecordings = {
	recorded: 'recorded',
	notArrived: 'not_arrived',
	lapsed: 'lapsed',
	alreadyRecorded: 'already_recorded'
} as const;

/**
 * Keeps the file that arrived at a granted link, at the size that actually arrived. A file that
 * arrived is always kept, however late it is recorded; nothing here deletes one.
 */
export async function recordBusinessBrainFile(supabase: SupabaseClient, file: BusinessBrainFile): Promise<BusinessBrainFileRecording> {
	if (file.recordedAt !== null) return { status: 'already_recorded' };
	const byteCount = await measureArrivedFile(supabase, file.storagePath);
	if (byteCount === null) return hasExpired(file.expiresAt) ? { status: 'lapsed' } : { status: 'not_arrived' };
	const isClaimed = await claimArrivedFile(supabase, file.id, byteCount);
	if (!isClaimed) return { status: 'already_recorded' };
	return { status: 'recorded', byteCount };
}

async function measureArrivedFile(supabase: SupabaseClient, storagePath: string): Promise<number | null> {
	const { data, error } = await supabase.storage.from(businessBrainFilesBucket).info(storagePath);
	if (error !== null) return null;
	return data.size ?? null;
}

/** One conditional update, so two callers cannot both record the same file. */
async function claimArrivedFile(supabase: SupabaseClient, fileId: string, byteCount: number): Promise<boolean> {
	const { data, error } = await supabase
		.from('business_brain_files')
		.update({ recorded_at: new Date().toISOString(), byte_count: byteCount })
		.eq('id', fileId)
		.is('recorded_at', null)
		.select('id');
	if (error) throw error;
	return data.length > 0;
}
