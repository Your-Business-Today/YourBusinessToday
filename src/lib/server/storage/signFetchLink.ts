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

/** Short-lived signed links for many kept files at once, each downloading under its stored name, by storage path. */
export async function signFetchLinks(supabase: SupabaseClient, bucket: string, storagePaths: string[]): Promise<Map<string, string>> {
	if (storagePaths.length === 0) return new Map();
	const { data, error } = await supabase.storage.from(bucket).createSignedUrls(storagePaths, fetchLinkLifetimeSeconds, { download: true });
	if (error !== null) throw error;
	const signedLinks = data.filter((signed) => signed.path !== null && signed.signedUrl !== null);
	return new Map(signedLinks.map((signed) => [String(signed.path), String(signed.signedUrl)]));
}

/** A short-lived signed link that shows the kept file in the browser, as a picture opened full size. */
export async function signShowLink(supabase: SupabaseClient, bucket: string, storagePath: string): Promise<string> {
	const { data, error } = await supabase.storage.from(bucket).createSignedUrl(storagePath, fetchLinkLifetimeSeconds);
	if (error !== null) throw error;
	return data.signedUrl;
}
