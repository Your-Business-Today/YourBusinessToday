import { describe, expect, it } from 'vitest';
import { findingsNeedSummary, sourcesRefusal, validatePersonResearch } from './validatePersonResearch';
import { personResearchLimits } from '$lib/data/personResearchRules';
import { rolesRefusal } from './validateFoundRoles';

const personId = '11111111-1111-4111-8111-111111111111';
const found = {
	personId,
	summary: 'Runs a joinery business in Surrey that fits out new homes.',
	sources: ['https://acmejoinery.co.uk/about']
};
const role = { title: 'Managing director', organisation: 'Acme Joinery', sourceUrl: 'https://acmejoinery.co.uk/team' };
const link = { label: 'Company site', url: 'https://acmejoinery.co.uk' };

describe('validatePersonResearch', () => {
	it('reads findings with their roles, links and sources', () => {
		const findings = validatePersonResearch({ ...found, roles: [role], links: [link] });
		expect(findings).toEqual({ ...found, roles: [role], links: [link] });
	});

	it('reads no roles and no links as none', () => {
		expect(validatePersonResearch(found)).toMatchObject({ roles: [], links: [] });
	});

	it('refuses a person id that is not an id', () => {
		expect(validatePersonResearch({ ...found, personId: 'ada' })).toContain('personId');
	});

	it('refuses findings with no summary or no page they were read from', () => {
		expect(validatePersonResearch({ ...found, summary: ' ' })).toBe(findingsNeedSummary);
		expect(validatePersonResearch({ ...found, sources: [] })).toBe(sourcesRefusal);
		expect(validatePersonResearch({ ...found, sources: undefined })).toBe(sourcesRefusal);
	});

	it('refuses a page behind a login or off the public web, wherever it is given', () => {
		const loginPage = 'https://www.linkedin.com/in/ada';
		expect(validatePersonResearch({ ...found, sources: [loginPage] })).toContain('behind a login');
		expect(validatePersonResearch({ ...found, roles: [{ ...role, sourceUrl: loginPage }] })).toContain('behind a login');
		expect(validatePersonResearch({ ...found, links: [{ ...link, url: loginPage }] })).toContain('behind a login');
		expect(validatePersonResearch({ ...found, links: [{ ...link, url: 'http://localhost/ada' }] })).toContain('public web page');
	});

	it('refuses a role with no page it came from', () => {
		expect(validatePersonResearch({ ...found, roles: [{ ...role, sourceUrl: '' }] })).toContain('Entry 1');
	});

	it('refuses rather than trims a value too long for where it is kept', () => {
		const longSummary = 'a'.repeat(personResearchLimits.longestSummary + 1);
		expect(validatePersonResearch({ ...found, summary: longSummary })).toBe(findingsNeedSummary);
		const longTitle = 'a'.repeat(personResearchLimits.longestRoleTitle + 1);
		expect(validatePersonResearch({ ...found, roles: [{ ...role, title: longTitle }] })).toContain('title');
		const tooManyRoles = Array.from({ length: personResearchLimits.mostRoles + 1 }, () => role);
		expect(validatePersonResearch({ ...found, roles: tooManyRoles })).toBe(`roles — ${rolesRefusal}`);
	});
});
