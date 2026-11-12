import { describe, expect, it } from 'vitest';
import { editedOrganisationDetails } from './editedOrganisationDetails';
import { blankOrganisationDetails } from './organisationRules';

const asHeld = {
	...blankOrganisationDetails,
	name: 'Harbour Dental',
	legalName: 'Harbour Dental Limited',
	address: '12 Station Road\nLeeds',
	noticesEmail: 'notices@harbourdental.example'
};

function givenFrom(edit: Record<string, string>) {
	return (fieldName: string) => edit[fieldName] ?? null;
}

describe('the details as an edit leaves them', () => {
	it('replace every value the edit gives', () => {
		const edited = editedOrganisationDetails(givenFrom({ name: 'Harbour Dental Care', companyNumber: '01234567' }), asHeld);
		expect(edited.name).toBe('Harbour Dental Care');
		expect(edited.companyNumber).toBe('01234567');
	});

	it('keep what is there for every value the edit leaves out', () => {
		const edited = editedOrganisationDetails(givenFrom({ companyNumber: '01234567' }), asHeld);
		expect(edited).toEqual({ ...asHeld, companyNumber: '01234567' });
	});

	it('blank a value the edit gives as blank', () => {
		const edited = editedOrganisationDetails(givenFrom({ address: '' }), asHeld);
		expect(edited.address).toBe('');
		expect(edited.legalName).toBe('Harbour Dental Limited');
	});

	it('hold an email address in lower case, and everything else as it was typed', () => {
		const edit = { signatoryEmail: 'Priya.Shah@HarbourDental.example', signatoryName: 'Priya Shah' };
		const edited = editedOrganisationDetails(givenFrom(edit), asHeld);
		expect(edited.signatoryEmail).toBe('priya.shah@harbourdental.example');
		expect(edited.signatoryName).toBe('Priya Shah');
	});
});
