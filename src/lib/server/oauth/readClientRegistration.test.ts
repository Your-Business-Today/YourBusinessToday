import { describe, expect, it } from 'vitest';
import { needsClientSecret, readClientRegistration } from './readClientRegistration';

const httpsRedirect = 'https://client.example/callback';

describe('readClientRegistration', () => {
	it('keeps every redirect URI and the name as sent', () => {
		const loopbacks = [httpsRedirect, 'http://localhost:3000/cb'];
		const registration = readClientRegistration({ redirect_uris: loopbacks, client_name: '  Claude  ' });
		expect(registration.redirectUris).toEqual(loopbacks);
		expect(registration.clientName).toBe('Claude');
	});

	it('names an anonymous client', () => {
		expect(readClientRegistration({ redirect_uris: [httpsRedirect] }).clientName).toBe('An MCP client');
	});

	it('falls back to public client authentication for an unsupported method', () => {
		const basic = readClientRegistration({
			redirect_uris: [httpsRedirect],
			token_endpoint_auth_method: 'client_secret_basic'
		});
		expect(basic.authenticationMethod).toBe('client_secret_basic');
		const unknown = readClientRegistration({
			redirect_uris: [httpsRedirect],
			token_endpoint_auth_method: 'private_key_jwt'
		});
		expect(unknown.authenticationMethod).toBe('none');
	});

	it('needs a secret for every method but none', () => {
		expect(needsClientSecret('none')).toBe(false);
		expect(needsClientSecret('client_secret_post')).toBe(true);
		expect(needsClientSecret('client_secret_basic')).toBe(true);
	});
});
