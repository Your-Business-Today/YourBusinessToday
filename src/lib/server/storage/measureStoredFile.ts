import type { SupabaseClient } from '@supabase/supabase-js';

/** The size of a file that has arrived in a bucket, or null when nothing is there yet. */
export async function measureStoredFile(supabase: SupabaseClient, bucket: string, storagePath: string): Promise<number | null> {
	const { data, error } = await supabase.storage.from(bucket).info(storagePath);
	if (error !== null) return null;
	return data.size ?? null;
}
