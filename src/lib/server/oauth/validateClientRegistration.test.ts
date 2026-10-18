import { describe, expect, it } from 'vitest';
import { validateClientRegistration } from './validateClientRegistration';

const httpsRedirect = 'https://client.example/callback';

describe('validateClientRegistration', () => {
	it('lets through what oauth_clients can hold, however the redirect rules then read it', () => {
		expect(validateClientRegistration({ redirect_uris: [httpsRedirect] })).toBeNull();
		expect(validateClientRegistration({ redirect_uris: [httpsRedirect], client_name: 'x'.repeat(300) })).toBeNull();
		expect(validateClientRegistration({ redirect_uris: ['ftp://x/y'], client_name: null })).toBeNull();
		expect(validateClientRegistration({})).toBeNull();
	});

	it('refuses a client_name that is not text as client metadata', () => {
		const refusal = validateClientRegistration({ redirect_uris: [httpsRedirect], client_name: 7 });
		expect(refusal).toEqual({ error: 'invalid_client_metadata', description: 'The client_name is text.' });
	});

	it('refuses a redirect URI that a text[] column cannot hold', () => {
		const notText = validateClientRegistration({ redirect_uris: [httpsRedirect, 7] });
		expect(notText).toEqual({ error: 'invalid_redirect_uri', description: 'The redirect URI is text.' });
		const withNul = validateClientRegistration({ redirect_uris: [`${httpsRedirect}\u0000`] });
		expect(withNul?.error).toBe('invalid_redirect_uri');
	});
});
