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
