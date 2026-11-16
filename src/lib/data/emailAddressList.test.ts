import { describe, expect, it } from 'vitest';
import { emailAddressLimits, readEmailAddressList } from './emailAddressList';

describe('readEmailAddressList', () => {
	it('reads the addresses trimmed, in lower case and each once', () => {
		expect(readEmailAddressList('addresses', [' Jo@Acme.co.uk ', 'jo@acme.co.uk', 'sam@gmail.com'])).toEqual({ addresses: ['jo@acme.co.uk', 'sam@gmail.com'] });
	});

	it('refuses no list, or an empty one', () => {
		expect(readEmailAddressList('addresses', undefined)).toEqual({ refusal: 'addresses must be a list of at least one email address.' });
		expect(readEmailAddressList('addresses', [])).toEqual({ refusal: 'addresses must be a list of at least one email address.' });
	});

	it('refuses more addresses than one email carries', () => {
		const tooMany = Array.from({ length: emailAddressLimits.mostAddresses + 1 }, (_, index) => `person${index}@acme.co.uk`);
		expect(readEmailAddressList('addresses', tooMany)).toEqual({
			refusal: 'addresses holds 21 addresses; give at most 20, the from, to and cc of one email.'
		});
	});

	it('refuses by name an address that is not one, or is longer than an address can be', () => {
		expect(readEmailAddressList('addresses', ['Jo Bloggs <jo@acme.co.uk>'])).toEqual({
			refusal: 'addresses: "jo bloggs <jo@acme.co.uk>" is not an email address, such as name@example.com.'
		});
		const tooLong = `${'a'.repeat(emailAddressLimits.longestAddress)}@acme.co.uk`;
		expect(readEmailAddressList('addresses', [tooLong])).toEqual({
			refusal: `addresses: "${'a'.repeat(40)}…" is longer than an email address can be, 254 characters.`
		});
	});
});
