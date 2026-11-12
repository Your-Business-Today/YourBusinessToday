import { describe, expect, it } from 'vitest';
import { blankOrganisationDetails } from '$lib/data/organisationRules';
import { describeOrganisationInFull } from './describeOrganisation';

const harbourDental = {
	...blankOrganisationDetails,
	id: 'organisation-1',
	name: 'Harbour Dental',
	legalName: 'Harbour Dental Limited',
	companyNumber: '01234567',
	address: '12 Station Road, Leeds',
	accountsContactEmail: 'accounts@harbourdental.example',
	signatoryName: 'Sam Okafor',
	dataContactName: 'Priya Shah',
	createdAt: '2026-11-12T09:00:00Z'
};

const description = describeOrganisationInFull(harbourDental, [], []);
const lines = description.split('\n');

describe('an organisation described in full to a person’s Claude', () => {
	it('opens with its name and id', () => {
		expect(lines[0]).toBe('Harbour Dental (id: organisation-1)');
	});

	it('lists what we hold about it under the headings the Details page uses, in the page’s order', () => {
		const headings = ['Company:', 'Invoicing:', 'Contract:', 'Data protection:'];
		const positions = headings.map((heading) => lines.indexOf(heading));
		expect(positions.every((position) => position > 0)).toBe(true);
		expect(positions).toEqual([...positions].sort((first, second) => first - second));
	});

	it('gives each detail by its label, and says which are not set', () => {
		expect(lines).toContain('Legal name: Harbour Dental Limited');
		expect(lines).toContain('Company number: 01234567');
		expect(lines).toContain('Invoice address: 12 Station Road, Leeds');
		expect(lines).toContain('Signatory: Sam Okafor');
		expect(lines).toContain('Data protection contact: Priya Shah');
		expect(lines).toContain('VAT number: not set');
		expect(lines).toContain('Notices email: not set');
	});

	it('still ends with its people and its projects', () => {
		expect(description).toContain('People:\nNobody yet.');
		expect(description).toContain('Projects:\nNone yet.');
	});
});
