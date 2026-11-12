import { describe, expect, it } from 'vitest';
import { blankOrganisationDetails } from '$lib/data/organisationRules';
import { organisationDetailFields } from '$lib/data/organisationDetailGroups';
import { organisationDetailsAfter, organisationDetailsFields } from './organisationDetailsFields';

const asHeld = {
	...blankOrganisationDetails,
	name: 'Harbour Dental',
	legalName: 'Harbour Dental Limited',
	address: '12 Station Road\nLeeds'
};

const fieldNames = Object.keys(organisationDetailsFields);
const descriptions = organisationDetailsFields as Record<string, { type: string; description: string }>;

describe('the details an organisation action takes', () => {
	it('are the name and every detail, by the names the form uses', () => {
		expect(fieldNames).toEqual(['name', ...organisationDetailFields.map((field) => field.key)]);
	});

	it('each say what the detail is, and that leaving it out keeps what is there', () => {
		expect(descriptions.legalName).toEqual({
			type: 'string',
			description: 'Its registered name, as the contract and every invoice name it — leave out to keep what is there'
		});
		for (const field of organisationDetailFields) {
			expect(descriptions[field.key].description).toContain('leave out to keep what is there');
		}
	});

	it('replace a detail the action gives and keep every one it leaves out', () => {
		const details = organisationDetailsAfter({ companyNumber: ' 01234567 ', noticesEmail: 'Notices@HarbourDental.example' }, asHeld);
		expect(details).toEqual({ ...asHeld, companyNumber: '01234567', noticesEmail: 'notices@harbourdental.example' });
	});

	it('take a detail given as null as left out, and one given as blank as blank', () => {
		const details = organisationDetailsAfter({ legalName: null, address: '' }, asHeld);
		expect(details.legalName).toBe('Harbour Dental Limited');
		expect(details.address).toBe('');
	});
});
