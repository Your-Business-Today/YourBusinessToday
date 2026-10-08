import { env } from '$env/dynamic/private';

/** Upload links are signed with the service key, so there is nothing new to configure and a rotated key ends them all. */
export function uploadLinkSigningKey(): string {
	if (!env.SUPABASE_SECRET_KEY) throw new Error('missing_supabase_secret_key');
	return env.SUPABASE_SECRET_KEY;
}
