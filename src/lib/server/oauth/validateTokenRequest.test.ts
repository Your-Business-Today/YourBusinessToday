import { describe, expect, it } from 'vitest';
import { validateTokenRequest } from './validateTokenRequest';
import type { TokenRequest } from './readTokenRequest';

const tokenRequest: TokenRequest = {
	grantType: 'authorization_code',
	clientId: 'ybt_client_abc',
	clientSecret: '',
	code: 'ybt_ac_abc',
	redirectUri: 'https://client.example/callback',
	codeVerifier: 'verifier',
	refreshToken: ''
};

describe('validateTokenRequest', () => {
	it('lets through a client_id the token columns can hold', () => {
		expect(validateTokenRequest(tokenRequest)).toBeNull();
		expect(validateTokenRequest({ ...tokenRequest, clientId: '' })).toBeNull();
	});

	it('refuses a client_id holding a NUL character', () => {
		expect(validateTokenRequest({ ...tokenRequest, clientId: 'ybt\u0000' })).toBe(
			'The client_id cannot contain a NUL character.'
		);
	});
});
