import { describe, expect, it } from 'vitest';
import { companyResearchLimits } from '$lib/data/companyResearchRules';
import { findingsNeedSummary, newLeadNeedsName, validateCompanyResearch } from './validateCompanyResearch';
import { openingAnglesRefusal } from './validateOpeningAngles';

const clientId = '11111111-1111-4111-8111-111111111111';
const found = {
	name: 'Acme Joinery',
	website: 'https://acmejoinery.co.uk',
	sourceUrl: 'https://acmejoinery.co.uk/about',
	summary: 'Bespoke joinery for house builders in Surrey.'
};

describe('validateCompanyResearch', () => {
	it('reads findings for a new lead, with the postcode written as the register writes it', () => {
		const findings = validateCompanyResearch({ ...found, postcode: 'kt1 1aa', openingAngles: ['They are hiring'] });
		expect(findings).toMatchObject({ clientId: null, name: 'Acme Joinery', postcode: 'KT1 1AA', openingAngles: ['They are hiring'], people: [] });
	});

	it('takes a client already on the register by its id, with no name', () => {
		expect(validateCompanyResearch({ ...found, name: '', clientId })).toMatchObject({ clientId });
	});

	it('refuses a new lead with no name and a client id that is not an id', () => {
		expect(validateCompanyResearch({ ...found, name: '' })).toBe(newLeadNeedsName);
		expect(validateCompanyResearch({ ...found, clientId: 'acme' })).toContain('clientId');
	});

	it('refuses a directory or social profile as the website', () => {
		expect(validateCompanyResearch({ ...found, website: 'https://www.yell.com/biz/acme' })).toContain('not the company');
		expect(validateCompanyResearch({ ...found, website: 'https://uk.linkedin.com/company/acme' })).toContain('not the company');
	});

	it('refuses a source behind a login or off the public web', () => {
		expect(validateCompanyResearch({ ...found, sourceUrl: 'https://www.linkedin.com/company/acme' })).toContain('behind a login');
		expect(validateCompanyResearch({ ...found, sourceUrl: 'http://localhost/about' })).toContain('public web page');
		expect(validateCompanyResearch({ ...found, sourceUrl: '' })).toContain('public web page');
	});

	it('refuses rather than trims a value too long for its column', () => {
		const summary = 'x'.repeat(companyResearchLimits.longestSummary + 1);
		expect(validateCompanyResearch({ ...found, summary })).toBe(findingsNeedSummary);
		expect(validateCompanyResearch({ ...found, summary: '' })).toBe(findingsNeedSummary);
		const industry = 'x'.repeat(companyResearchLimits.longestIndustry + 1);
		expect(validateCompanyResearch({ ...found, industry })).toContain('industry');
	});

	it('refuses a postcode, a band or a company number that does not fit', () => {
		expect(validateCompanyResearch({ ...found, postcode: 'Kingston KT1 1AA' })).toContain('not a UK postcode');
		expect(validateCompanyResearch({ ...found, headcountBand: 'about 30' })).toContain('headcount band');
		expect(validateCompanyResearch({ ...found, companyNumber: '1375' })).toContain('not a company number');
	});

	it('refuses opening angles that are not a short list', () => {
		expect(validateCompanyResearch({ ...found, openingAngles: 'They are hiring' })).toBe(openingAnglesRefusal);
		expect(validateCompanyResearch({ ...found, openingAngles: ['a', 'b', 'c', 'd', 'e'] })).toBe(openingAnglesRefusal);
		expect(validateCompanyResearch({ ...found, openingAngles: [''] })).toBe(openingAnglesRefusal);
	});

	it('names the person whose page is refused', () => {
		const people = [
			{ name: 'Ann Acme', role: 'Director', sourceUrl: 'https://acmejoinery.co.uk/team' },
			{ name: 'Bob Acme', role: 'Joiner', sourceUrl: 'https://facebook.com/bob' }
		];
		const refusal = validateCompanyResearch({ ...found, people });
		expect(refusal).toContain('Person 2');
		expect(refusal).toContain('behind a login');
		expect(validateCompanyResearch({ ...found, people: [{ name: '', sourceUrl: found.sourceUrl }] })).toContain('Person 1');
	});
});
