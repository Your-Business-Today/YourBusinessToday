import { describe, expect, it } from 'vitest';
import { detailKinds } from './organisationDetailField';
import { organisationDetailFields } from './organisationDetailGroups';
import {
	blankOrganisationDetails,
	longestOrganisationName,
	organisationNameTooLong,
	organisationNeedsName,
	validateOrganisationDetails
} from './organisationRules';

const jewelPassiveFire = {
	...blankOrganisationDetails,
	name: 'Jewel Passive Fire Protection',
	legalName: 'Jewel Passive Fire Protection Limited',
	companyNumber: '01234567',
	address: 'Unit 4, Jewel House, London',
	accountsContactName: 'Priya Shah',
	accountsContactEmail: 'accounts@jewelpfp.example',
	accountsContactPhone: '020 7000 0000',
	noticesEmail: 'notices@jewelpfp.example'
};

const emailFields = organisationDetailFields.filter((field) => field.kind === detailKinds.email);

describe('the organisation details rules', () => {
	it('accept a client with what we hold about it', () => {
		expect(validateOrganisationDetails(jewelPassiveFire)).toBeNull();
	});

	it('accept an organisation that has only a name so far', () => {
		expect(validateOrganisationDetails({ ...blankOrganisationDetails, name: 'Jewel Enterprises' })).toBeNull();
	});

	it('refuse an organisation without a name', () => {
		expect(validateOrganisationDetails({ ...jewelPassiveFire, name: '' })).toBe(organisationNeedsName);
	});

	it('refuse a name longer than its column', () => {
		const longName = 'J'.repeat(longestOrganisationName + 1);
		expect(validateOrganisationDetails({ ...jewelPassiveFire, name: longName })).toBe(organisationNameTooLong);
		expect(organisationNameTooLong).toBe('The organisation name is at most 120 characters.');
	});

	it('refuse every detail longer than its column, naming the field and the limit', () => {
		for (const field of organisationDetailFields) {
			const tooLong = 'x'.repeat(field.longest + 1);
			expect(validateOrganisationDetails({ ...jewelPassiveFire, [field.key]: tooLong })).toBe(
				`${field.label} is at most ${field.longest} characters.`
			);
		}
		const longAddress = 'A'.repeat(501);
		expect(validateOrganisationDetails({ ...jewelPassiveFire, address: longAddress })).toBe(
			'Invoice address is at most 500 characters.'
		);
	});

	it('accept a detail exactly as long as its column', () => {
		const legalName = 'L'.repeat(160);
		expect(validateOrganisationDetails({ ...jewelPassiveFire, legalName })).toBeNull();
	});

	it('refuse an email address that does not read as one, whichever detail holds it', () => {
		expect(emailFields.map((field) => field.key)).toEqual([
			'accountsContactEmail',
			'signatoryEmail',
			'noticesEmail',
			'dataContactEmail'
		]);
		for (const field of emailFields) {
			expect(validateOrganisationDetails({ ...jewelPassiveFire, [field.key]: 'accounts at jewel' })).toBe(
				`${field.label} does not read as an email address.`
			);
		}
	});
});
