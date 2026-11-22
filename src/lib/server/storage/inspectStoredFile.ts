import type { SupabaseClient } from '@supabase/supabase-js';

/** A file as storage holds it: its size and its kind as they arrived, whatever the browser said of them. */
export type StoredFileFacts = { sizeBytes: number; contentType: string };

const unknownKind = '';
const nothingStored = 0;

/** The size and kind of a file that has arrived in a bucket, or null when nothing is there yet. */
export async function inspectStoredFile(supabase: SupabaseClient, bucket: string, storagePath: string): Promise<StoredFileFacts | null> {
	const { data, error } = await supabase.storage.from(bucket).info(storagePath);
	if (error !== null) return null;
	return { sizeBytes: data.size ?? nothingStored, contentType: data.contentType ?? unknownKind };
}
