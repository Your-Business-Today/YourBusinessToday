import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { fetchWithDeadline } from '$lib/server/supabase/fetchWithDeadline';

export function supabaseServiceClient(): SupabaseClient {
	if (!env.SUPABASE_SECRET_KEY) throw new Error('missing_supabase_secret_key');
	return createClient(PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
		auth: { persistSession: false, autoRefreshToken: false },
		global: { fetch: fetchWithDeadline() }
	});
}
