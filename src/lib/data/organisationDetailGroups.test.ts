import { describe, expect, it } from 'vitest';
import { organisationDetailFields, organisationDetailGroups, readEveryDetail } from './organisationDetailGroups';

const titles = organisationDetailGroups.map((group) => group.title);
const keys = organisationDetailFields.map((field) => field.key);
const columns = organisationDetailFields.map((field) => field.column);

describe('what we hold about a client we sign up', () => {
	it('is grouped as the Details page reads: the company, its invoicing, its contract and its data protection', () => {
		expect(titles).toEqual(['Company', 'Invoicing', 'Contract', 'Data protection']);
	});

	it('names the party the contract and an invoice need: legal name, number, where registered and its office', () => {
		expect(keys).toEqual(expect.arrayContaining(['legalName', 'companyNumber', 'registeredIn', 'registeredOffice', 'vatNumber']));
	});

	it('names who signs and where notices go, and the contact a personal data breach is told to', () => {
		expect(keys).toEqual(expect.arrayContaining(['signatoryName', 'signatoryPosition', 'noticesEmail']));
		expect(keys).toEqual(expect.arrayContaining(['dataContactName', 'dataContactEmail', 'dataContactPhone', 'dataProtectionOfficer']));
	});

	it('keeps the address and the accounts contact in the columns they have always had', () => {
		expect(columns).toEqual(
			expect.arrayContaining(['address', 'accounts_contact_name', 'accounts_contact_email', 'accounts_contact_phone'])
		);
	});

	it('gives every detail a name and a column of its own', () => {
		expect(new Set(keys).size).toBe(keys.length);
		expect(new Set(columns).size).toBe(columns.length);
	});

	it('reads every detail once, by the reader it is given', () => {
		const labels = readEveryDetail((field) => field.label);
		expect(Object.keys(labels)).toEqual(keys);
		expect(labels.legalName).toBe('Legal name');
	});
});
