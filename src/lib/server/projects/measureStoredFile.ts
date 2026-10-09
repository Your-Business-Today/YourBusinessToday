import type { SupabaseClient } from '@supabase/supabase-js';
import { attachmentsBucket } from './attachmentStorage';

/** How many bytes actually landed at a storage path, or null when nothing is there. */
export async function measureStoredFile(
	supabase: SupabaseClient,
	storagePath: string
): Promise<number | null> {
	const { data, error } = await supabase.storage.from(attachmentsBucket).info(storagePath);
	if (error !== null) return null;
	return data.size ?? null;
}
