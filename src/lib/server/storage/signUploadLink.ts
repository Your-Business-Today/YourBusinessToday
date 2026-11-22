import type { SupabaseClient } from '@supabase/supabase-js';

/** A signed link that takes one upload of the file to be kept at that path in the bucket. */
export async function signUploadLink(supabase: SupabaseClient, bucket: string, storagePath: string): Promise<string> {
	const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(storagePath);
	if (error !== null) throw error;
	return data.signedUrl;
}
