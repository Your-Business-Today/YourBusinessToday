import { describe, expect, it } from 'vitest';
import { organisationDetailColumns, parseOrganisationRecord } from './organisationRecord';
import { organisationDetailFields } from '$lib/data/organisationDetailGroups';

const rowBeforeTheNewColumns = {
	id: 'organisation-1',
	name: 'Harbour Dental',
	address: '12 Station Road\nLeeds',
	accounts_contact_name: 'Priya Shah',
	accounts_contact_email: 'accounts@harbourdental.example',
	accounts_contact_phone: '0113 496 0000',
	created_at: '2026-11-12T09:00:00Z'
};

const rowWithEveryColumn = {
	...rowBeforeTheNewColumns,
	legal_name: 'Harbour Dental Limited',
	company_number: '01234567',
	registered_in: 'England and Wales',
	registered_office: '1 Quay Street\nLeeds',
	vat_number: 'GB123456789',
	signatory_name: 'Sam Okafor',
	signatory_position: 'Director',
	signatory_email: 'sam@harbourdental.example',
	notices_email: 'notices@harbourdental.example',
	data_contact_name: 'Priya Shah',
	data_contact_email: 'privacy@harbourdental.example',
	data_contact_phone: '0113 496 0001',
	data_protection_officer: 'None'
};

describe('an organisation as the database holds it', () => {
	it('reads every detail from its own column', () => {
		const organisation = parseOrganisationRecord(rowWithEveryColumn);
		expect(organisation.legalName).toBe('Harbour Dental Limited');
		expect(organisation.registeredOffice).toBe('1 Quay Street\nLeeds');
		expect(organisation.dataContactEmail).toBe('privacy@harbourdental.example');
		expect(organisation.address).toBe('12 Station Road\nLeeds');
		expect(organisation.createdAt).toBe('2026-11-12T09:00:00Z');
	});

	it('reads blank for a detail whose column is not there yet, and keeps what the row does hold', () => {
		const organisation = parseOrganisationRecord(rowBeforeTheNewColumns);
		expect(organisation.legalName).toBe('');
		expect(organisation.noticesEmail).toBe('');
		expect(organisation.accountsContactName).toBe('Priya Shah');
		expect(organisation.accountsContactEmail).toBe('accounts@harbourdental.example');
	});

	it('writes the name and every detail, each to its own column', () => {
		const columns = organisationDetailColumns(parseOrganisationRecord(rowWithEveryColumn));
		const { id, created_at, ...detailsAsStored } = rowWithEveryColumn;
		expect(columns).toEqual(detailsAsStored);
		expect(Object.keys(columns)).toHaveLength(organisationDetailFields.length + 1);
		expect([id, created_at]).not.toContain(undefined);
	});
});
