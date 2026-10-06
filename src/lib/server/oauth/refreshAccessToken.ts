import {
	hashSecret,
	issueTokensFor,
	oauthTokenKinds,
	revokeToken,
	type IssuedTokens
} from './oauthTokens';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';

export async function refreshAccessToken(
	refreshToken: string,
	clientId: string
): Promise<IssuedTokens | 'invalid_grant'> {
	const supabase = supabaseServiceClient();
	const tokenHash = hashSecret(refreshToken);
	const { data, error } = await supabase
		.from('oauth_tokens')
		.select('account_id, client_id, kind, expires_at, revoked_at')
		.eq('token_hash', tokenHash)
		.maybeSingle();
	if (error) throw error;
	if (data === null || data.kind !== oauthTokenKinds.refresh) return 'invalid_grant';
	if (data.revoked_at !== null) return 'invalid_grant';
	if (data.client_id !== clientId) return 'invalid_grant';
	if (new Date(data.expires_at).getTime() < Date.now()) return 'invalid_grant';
	await revokeToken(supabase, tokenHash);
	return issueTokensFor(supabase, clientId, data.account_id);
}
