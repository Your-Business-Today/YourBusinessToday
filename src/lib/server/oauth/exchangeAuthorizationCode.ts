import { hashSecret, issueTokensFor, type IssuedTokens } from './oauthTokens';
import { isAuthorizationCodeUsable, type ClaimedAuthorizationCode } from './isAuthorizationCodeUsable';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ExchangeFailure = 'invalid_grant';

export async function exchangeAuthorizationCode(
	code: string,
	clientId: string,
	redirectUri: string,
	codeVerifier: string
): Promise<IssuedTokens | ExchangeFailure> {
	const supabase = supabaseServiceClient();
	const claimedCode = await claimCode(supabase, hashSecret(code));
	if (claimedCode === null) return 'invalid_grant';
	if (!isAuthorizationCodeUsable(claimedCode, { clientId, redirectUri, codeVerifier })) {
		return 'invalid_grant';
	}
	return issueTokensFor(supabase, clientId, claimedCode.account_id);
}

/**
 * Claiming is one conditional update, so a code presented twice at once is
 * spent exactly once, and a code that fails its checks is spent rather than
 * left open for another try.
 */
async function claimCode(
	supabase: SupabaseClient,
	codeHash: string
): Promise<ClaimedAuthorizationCode | null> {
	const { data, error } = await supabase
		.from('oauth_authorization_codes')
		.update({ used_at: new Date().toISOString() })
		.eq('code_hash', codeHash)
		.is('used_at', null)
		.select('account_id, client_id, redirect_uri, code_challenge, expires_at')
		.maybeSingle();
	if (error) throw error;
	return data;
}
