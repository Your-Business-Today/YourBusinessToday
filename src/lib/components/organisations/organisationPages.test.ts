import { describe, expect, it } from 'vitest';
import { currentOrganisationPage, organisationPageLinks, organisationPages } from './organisationPages';

const harbour = 'harbour-group';

describe('organisationPageLinks', () => {
	it('gives an organisation Overview and Domain, and leaves its tasks to the side bar', () => {
		const links = organisationPageLinks(harbour);
		expect(links.map(({ label }) => label)).toEqual(['Overview', 'Domain']);
		expect(links.map(({ href }) => href)).toEqual(['/organisations/harbour-group', '/organisations/harbour-group/domain']);
	});
});

describe('currentOrganisationPage', () => {
	it('finds the tab a page sits under', () => {
		expect(currentOrganisationPage(harbour, '/organisations/harbour-group')).toBe(organisationPages.overview);
		expect(currentOrganisationPage(harbour, '/organisations/harbour-group/domain')).toBe(organisationPages.domain);
	});
});
