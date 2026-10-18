import { describe, expect, it } from 'vitest';
import { validateClientRegistration } from './validateClientRegistration';

const httpsRedirect = 'https://client.example/callback';
const invalidRedirect = 'invalid_redirect_uri';

describe('validateClientRegistration client_name', () => {
	it('lets through a registration oauth_clients can hold', () => {
		expect(validateClientRegistration({ redirect_uris: [httpsRedirect] })).toBeNull();
		expect(validateClientRegistration({ redirect_uris: [httpsRedirect], client_name: 'x'.repeat(200) })).toBeNull();
	});

	it('refuses a client_name that is not text or is longer than 200 characters', () => {
		const notText = validateClientRegistration({ redirect_uris: [httpsRedirect], client_name: 7 });
		expect(notText).toEqual({ error: 'invalid_client_metadata', description: 'The client_name is text.' });
		const tooLong = validateClientRegistration({ redirect_uris: [httpsRedirect], client_name: 'x'.repeat(201) });
		expect(tooLong).toEqual({
			error: 'invalid_client_metadata',
			description: 'The client_name is at most 200 characters.'
		});
	});
});

describe('validateClientRegistration redirect URIs', () => {
	it('refuses a registration with no redirect URIs', () => {
		expect(validateClientRegistration({})?.error).toBe(invalidRedirect);
		expect(validateClientRegistration({ redirect_uris: [] })?.error).toBe(invalidRedirect);
		expect(validateClientRegistration({ redirect_uris: 'not-a-list' })?.error).toBe(invalidRedirect);
	});

	it('accepts https on any host and plain http only on loopback hosts', () => {
		const loopbacks = ['http://localhost:3000/cb', 'http://127.0.0.1/cb', 'http://[::1]:8080/cb'];
		expect(validateClientRegistration({ redirect_uris: [httpsRedirect, ...loopbacks] })).toBeNull();
		expect(validateClientRegistration({ redirect_uris: ['http://client.example/cb'] })?.error).toBe(invalidRedirect);
	});

	it('refuses the whole registration when any redirect URI is unacceptable, rather than dropping it', () => {
		const mixed = validateClientRegistration({ redirect_uris: ['not a url', httpsRedirect] });
		expect(mixed).toEqual({
			error: invalidRedirect,
			description: 'The redirect URI not a url must be https, or plain http on a loopback host.'
		});
	});

	it('refuses more than ten redirect URIs rather than keeping the first ten', () => {
		const many = Array.from({ length: 11 }, (_, index) => `https://client.example/cb/${index}`);
		expect(validateClientRegistration({ redirect_uris: many })).toEqual({
			error: invalidRedirect,
			description: 'A client registers at most 10 redirect URIs.'
		});
	});

	it('refuses a redirect URI that a text[] column cannot hold', () => {
		expect(validateClientRegistration({ redirect_uris: [httpsRedirect, 7] })?.description).toBe('The redirect URI is text.');
		expect(validateClientRegistration({ redirect_uris: [`${httpsRedirect}\u0000`] })?.error).toBe(invalidRedirect);
	});
});
