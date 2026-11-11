import { describe, expect, it } from 'vitest';
import { currentOrganisationPage, organisationPageLinks, organisationPages } from './organisationPages';

const harbour = 'harbour-group';

describe('organisationPageLinks', () => {
	it('gives an organisation Overview, Task Management and Domain, and no Development', () => {
		const links = organisationPageLinks(harbour);
		expect(links.map(({ label }) => label)).toEqual(['Overview', 'Task Management', 'Domain']);
		expect(links.map(({ href }) => href)).toEqual([
			'/organisations/harbour-group',
			'/organisations/harbour-group/task-management',
			'/organisations/harbour-group/domain'
		]);
	});
});

describe('currentOrganisationPage', () => {
	it('finds the tab a page sits under', () => {
		expect(currentOrganisationPage(harbour, '/organisations/harbour-group')).toBe(organisationPages.overview);
		expect(currentOrganisationPage(harbour, '/organisations/harbour-group/task-management')).toBe(organisationPages.taskManagement);
		expect(currentOrganisationPage(harbour, '/organisations/harbour-group/domain')).toBe(organisationPages.domain);
	});
});
