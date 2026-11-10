import { describe, expect, it } from 'vitest';
import { clientSetUpLimits } from '$lib/onboarding/onboarding';
import { nobodyToSetUp, validateSetUpPeople, validateSetUpPerson } from './validateClientSetUp';

const sam = { name: 'Sam Smith', email: 'sam@acme.example' };
const alex = { name: 'Alex Jones', email: 'alex@acme.example' };

describe('one of the first people a client is set up with', () => {
	it('is taken trimmed, with the email address in lower case', () => {
		expect(validateSetUpPerson(' Sam Smith ', ' Sam@Acme.Example ')).toEqual(sam);
	});

	it('is refused without a name', () => {
		expect(validateSetUpPerson(' ', 'sam@acme.example')).toHaveProperty('refusal');
	});

	it('is refused without an email address the link can go to', () => {
		expect(validateSetUpPerson('Sam Smith', 'sam at acme')).toHaveProperty('refusal');
	});

	it('refuses a name longer than its column, rather than cutting it', () => {
		const name = 'S'.repeat(clientSetUpLimits.nameLength + 1);
		expect(validateSetUpPerson(name, 'sam@acme.example')).toHaveProperty('refusal');
	});
});

describe('the first people together', () => {
	it('goes ahead with each person once, in the order given', () => {
		expect(validateSetUpPeople([sam, alex])).toEqual([sam, alex]);
	});

	it('is refused with nobody named', () => {
		expect(validateSetUpPeople([])).toEqual(nobodyToSetUp);
	});

	it('is refused when anyone in it is', () => {
		const refusal = { refusal: 'Give each person’s name.' };
		expect(validateSetUpPeople([sam, refusal])).toEqual(refusal);
	});

	it('is refused when the same address is named twice', () => {
		expect(validateSetUpPeople([sam, { ...alex, email: sam.email }])).toHaveProperty('refusal');
	});

	it('is refused past the most one set-up takes', () => {
		const people = Array.from({ length: clientSetUpLimits.mostPeople + 1 }, (_, position) => ({
			name: `Person ${position}`,
			email: `person${position}@acme.example`
		}));
		expect(validateSetUpPeople(people)).toHaveProperty('refusal');
	});
});
