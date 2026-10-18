import { describe, expect, it } from 'vitest';
import { readTokenRequest } from './readTokenRequest';

function jsonRequest(body: unknown): Request {
	return new Request('https://ybt.example/oauth/token', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body)
	});
}

describe('readTokenRequest JSON bodies', () => {
	it('reads text fields as sent', async () => {
		const tokenRequest = await readTokenRequest(jsonRequest({ grant_type: 'refresh_token', client_id: 'c', refresh_token: 'r' }));
		expect(tokenRequest?.clientId).toBe('c');
		expect(tokenRequest?.refreshToken).toBe('r');
	});

	it('refuses a token field that is not text rather than coercing it', async () => {
		expect(await readTokenRequest(jsonRequest({ grant_type: 'refresh_token', client_id: 5 }))).toBeNull();
	});

	it('ignores fields the token request does not read', async () => {
		const tokenRequest = await readTokenRequest(jsonRequest({ grant_type: 'refresh_token', resource: ['x'] }));
		expect(tokenRequest?.grantType).toBe('refresh_token');
	});
});

function basicRequest(credentials: string): Request {
	return new Request('https://ybt.example/oauth/token', {
		method: 'POST',
		headers: {
			'content-type': 'application/x-www-form-urlencoded',
			authorization: `Basic ${Buffer.from(credentials).toString('base64')}`
		},
		body: 'grant_type=refresh_token&refresh_token=r'
	});
}

describe('readTokenRequest Basic credentials', () => {
	it('reads percent-encoded credentials', async () => {
		const tokenRequest = await readTokenRequest(basicRequest('client%20one:s%3Acret'));
		expect(tokenRequest?.clientId).toBe('client one');
		expect(tokenRequest?.clientSecret).toBe('s:cret');
	});

	it('refuses a malformed escape or a missing separator as an invalid request', async () => {
		expect(await readTokenRequest(basicRequest('client%zz:secret'))).toBeNull();
		expect(await readTokenRequest(basicRequest('no-separator'))).toBeNull();
	});
});
