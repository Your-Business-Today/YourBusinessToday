import { bearerToken } from '$lib/server/tokens/bearerToken';
import { hashSecret } from '$lib/server/oauth/oauthTokens';
import { resolveAccountStanding, type AccountStanding } from './resolveAccountStanding';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { SupabaseClient } from '@supabase/supabase-js';
import { oauthTokenKinds } from '$lib/server/oauth/oauthTokens';

export type McpCaller = AccountStanding & { supabase: SupabaseClient };

const accessTokenPrefix = 'ybt_at_';

export async function resolveMcpCaller(request: Request): Promise<McpCaller | null> {
	const token = bearerToken(request);
	if (!token.startsWith(accessTokenPrefix)) return null;
	const supabase = supabaseServiceClient();
	const { data, error } = await supabase
		.from('oauth_tokens')
		.select('id, account_id, kind, expires_at, revoked_at')
		.eq('token_hash', hashSecret(token))
		.maybeSingle();
	if (error) throw error;
	if (data === null || data.kind !== oauthTokenKinds.access || data.revoked_at !== null) return null;
	if (new Date(data.expires_at).getTime() < Date.now()) return null;
	await stampUse(supabase, data.id);
	const standing = await resolveAccountStanding(supabase, data.account_id);
	if (standing === null) return null;
	return { ...standing, supabase };
}

async function stampUse(supabase: SupabaseClient, tokenId: string): Promise<void> {
	const { error } = await supabase
		.from('oauth_tokens')
		.update({ last_used_at: new Date().toISOString() })
		.eq('id', tokenId);
	if (error) throw error;
}
