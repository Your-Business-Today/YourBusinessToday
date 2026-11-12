import { describe, expect, it } from 'vitest';
import { blankOrganisationDetails } from '$lib/data/organisationRules';
import { readOrganisationDetails } from './organisationDetailsForm';

const asHeld = {
	...blankOrganisationDetails,
	name: 'Harbour Dental',
	legalName: 'Harbour Dental Limited',
	address: '12 Station Road\nLeeds',
	noticesEmail: 'notices@harbourdental.example'
};

function formHolding(fields: Record<string, string>): FormData {
	const formData = new FormData();
	for (const [fieldName, typed] of Object.entries(fields)) formData.set(fieldName, typed);
	return formData;
}

describe('the organisation details form', () => {
	it('takes every field the form carries, without the spaces round it', () => {
		const form = formHolding({ name: ' Harbour Dental Care ', companyNumber: ' 01234567 ', vatNumber: 'GB123456789' });
		const details = readOrganisationDetails(form, asHeld);
		expect(details.name).toBe('Harbour Dental Care');
		expect(details.companyNumber).toBe('01234567');
		expect(details.vatNumber).toBe('GB123456789');
	});

	it('blanks a field the form carries empty', () => {
		const details = readOrganisationDetails(formHolding({ name: 'Harbour Dental', address: '' }), asHeld);
		expect(details.address).toBe('');
	});

	it('keeps what is there for a field the form does not carry, as a page opened before the field was added', () => {
		const formFromBefore = formHolding({
			name: 'Harbour Dental',
			address: '14 Station Road\nLeeds',
			accountsContactName: 'Priya Shah',
			accountsContactEmail: 'Accounts@HarbourDental.example',
			accountsContactPhone: ''
		});
		const details = readOrganisationDetails(formFromBefore, asHeld);
		expect(details.legalName).toBe('Harbour Dental Limited');
		expect(details.noticesEmail).toBe('notices@harbourdental.example');
		expect(details.address).toBe('14 Station Road\nLeeds');
		expect(details.accountsContactEmail).toBe('accounts@harbourdental.example');
	});

	it('starts a new organisation blank but for what the form carries', () => {
		const details = readOrganisationDetails(formHolding({ name: 'Quay Builders' }), blankOrganisationDetails);
		expect(details).toEqual({ ...blankOrganisationDetails, name: 'Quay Builders' });
	});
});
