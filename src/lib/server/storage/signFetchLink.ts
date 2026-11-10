import type { SupabaseClient } from '@supabase/supabase-js';

/** A fetch link lasts ten minutes: long enough for a Claude to fetch the file, too short to pass around. */
export const fetchLinkLifetimeMinutes = 10;

const secondsInAMinute = 60;
const fetchLinkLifetimeSeconds = fetchLinkLifetimeMinutes * secondsInAMinute;

/** A kept file as storage knows it: where it is, and the name it downloads under. */
export type FetchableFile = { storagePath: string; filename: string };

/** A short-lived signed link that downloads the kept file under its own name. */
export async function signFetchLink(supabase: SupabaseClient, bucket: string, file: FetchableFile): Promise<string> {
	const options = { download: file.filename };
	const { data, error } = await supabase.storage.from(bucket).createSignedUrl(file.storagePath, fetchLinkLifetimeSeconds, options);
	if (error !== null) throw error;
	return data.signedUrl;
}
