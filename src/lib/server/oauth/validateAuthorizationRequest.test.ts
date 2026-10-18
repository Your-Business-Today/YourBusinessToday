import { describe, expect, it } from 'vitest';
import { validateAuthorizationRequest } from './validateAuthorizationRequest';

const wellFormed = {
	response_type: 'code',
	client_id: 'ybt_client_abc',
	redirect_uri: 'https://client.example/callback',
	code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
	code_challenge_method: 'S256'
};

describe('validateAuthorizationRequest', () => {
	it('lets through every value the authorization code columns can hold', () => {
		expect(validateAuthorizationRequest(new URLSearchParams(wellFormed))).toBeNull();
		expect(validateAuthorizationRequest(new URLSearchParams())).toBeNull();
	});

	it('refuses a NUL character in a value it would store, naming the field', () => {
		const parameters = new URLSearchParams({ ...wellFormed, code_challenge: 'abc\u0000' });
		expect(validateAuthorizationRequest(parameters)).toBe(
			'The code_challenge cannot contain a NUL character.'
		);
		const decoded = new URLSearchParams('client_id=ybt%00');
		expect(validateAuthorizationRequest(decoded)).toBe('The client_id cannot contain a NUL character.');
	});
});
