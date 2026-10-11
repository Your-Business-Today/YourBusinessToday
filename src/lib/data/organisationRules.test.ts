import { describe, expect, it } from 'vitest';
import {
	accountsContactEmailRefusal,
	emptyAccountsContact,
	longestAccountsContactPhone,
	longestOrganisationAddress,
	longestOrganisationName,
	organisationNeedsName,
	validateOrganisationDetails
} from './organisationRules';

const jewelPassiveFire = {
	name: 'Jewel Passive Fire Protection',
	address: 'Unit 4, Jewel House, London',
	accountsContact: { name: 'Jeremy Ferendinos', email: 'accounts@jewelpfp.example', phone: '020 7000 0000' }
};

describe('the organisation details rules', () => {
	it('accept a sub-organisation with its own invoicing details', () => {
		expect(validateOrganisationDetails(jewelPassiveFire)).toBeNull();
	});

	it('accept an organisation that has only a name so far', () => {
		expect(validateOrganisationDetails({ name: 'Jewel Enterprises', address: '', accountsContact: emptyAccountsContact })).toBeNull();
	});

	it('refuse an organisation without a name', () => {
		expect(validateOrganisationDetails({ ...jewelPassiveFire, name: '' })).toBe(organisationNeedsName);
	});

	it('refuse a value longer than its column, naming the field and the limit', () => {
		const longName = 'J'.repeat(longestOrganisationName + 1);
		expect(validateOrganisationDetails({ ...jewelPassiveFire, name: longName })).toBe(
			`The organisation name is at most ${longestOrganisationName} characters.`
		);
		const longAddress = 'A'.repeat(longestOrganisationAddress + 1);
		expect(validateOrganisationDetails({ ...jewelPassiveFire, address: longAddress })).toBe(
			`The address is at most ${longestOrganisationAddress} characters.`
		);
		const longPhone = '0'.repeat(longestAccountsContactPhone + 1);
		const contact = { ...jewelPassiveFire.accountsContact, phone: longPhone };
		expect(validateOrganisationDetails({ ...jewelPassiveFire, accountsContact: contact })).toBe(
			`The accounts contact phone is at most ${longestAccountsContactPhone} characters.`
		);
	});

	it('refuse an accounts contact email that is not one', () => {
		const contact = { ...jewelPassiveFire.accountsContact, email: 'accounts at jewel' };
		expect(validateOrganisationDetails({ ...jewelPassiveFire, accountsContact: contact })).toBe(
			accountsContactEmailRefusal
		);
	});
});
