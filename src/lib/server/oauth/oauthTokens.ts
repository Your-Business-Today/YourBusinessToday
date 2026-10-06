import { createHash, randomBytes } from 'node:crypto';
import {
	accessTokenLifetimeSeconds,
	refreshTokenLifetimeSeconds
} from './oauthSettings';
import type { SupabaseClient } from '@supabase/supabase-js';

export type OauthTokenKind = 'access' | 'refresh';

export const oauthTokenKinds = { access: 'access', refresh: 'refresh' } as const;

const tokenBytes = 32;

export type IssuedTokens = {
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
};

export function hashSecret(secret: string): string {
	return createHash('sha256').update(secret).digest('hex');
}

export function mintSecret(prefix: string): string {
	return `${prefix}${randomBytes(tokenBytes).toString('hex')}`;
}

export async function issueTokensFor(
	supabase: SupabaseClient,
	clientId: string,
	accountId: string
): Promise<IssuedTokens> {
	const accessToken = mintSecret('ybt_at_');
	const refreshToken = mintSecret('ybt_rt_');
	const { error } = await supabase.from('oauth_tokens').insert([
		tokenRow(accessToken, 'access', clientId, accountId, accessTokenLifetimeSeconds),
		tokenRow(refreshToken, 'refresh', clientId, accountId, refreshTokenLifetimeSeconds)
	]);
	if (error) throw error;
	return { accessToken, refreshToken, expiresIn: accessTokenLifetimeSeconds };
}

export async function revokeToken(supabase: SupabaseClient, tokenHash: string): Promise<void> {
	const { error } = await supabase
		.from('oauth_tokens')
		.update({ revoked_at: new Date().toISOString() })
		.eq('token_hash', tokenHash);
	if (error) throw error;
}

function tokenRow(
	token: string,
	kind: OauthTokenKind,
	clientId: string,
	accountId: string,
	lifetimeSeconds: number
) {
	return {
		token_hash: hashSecret(token),
		kind,
		client_id: clientId,
		account_id: accountId,
		expires_at: new Date(Date.now() + lifetimeSeconds * 1000).toISOString()
	};
}
