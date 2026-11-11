import { describe, expect, it } from 'vitest';
import { organisationHomePathFor, projectPageLinksFor } from './projectPageLinks';

const projectId = '33333333-3333-4333-8333-333333333333';
const organisation = { id: 'harbour', name: 'Harbour Builders', organisationId: 'harbour', portalClientId: null };
const clientCompany = { ...organisation, portalClientId: 'harbour-client' };

describe('projectPageLinksFor', () => {
	it('opens the board first for the people on the organisation, then the project’s other pages', () => {
		const links = projectPageLinksFor(organisation, projectId);
		expect(links.map(({ label }) => label)).toEqual(['Home', 'Domain', 'Site map', 'Deployment history']);
		expect(links[0].href).toBe(`/projects/${projectId}`);
		expect(links[3].href).toBe(`/projects/${projectId}/deploys`);
	});

	it('opens the project’s progress at the portal for a client’s contact', () => {
		expect(projectPageLinksFor(clientCompany, projectId)).toEqual([
			{ href: `/portal/projects/${projectId}`, label: 'Home' }
		]);
	});
});

describe('organisationHomePathFor', () => {
	it('opens the organisation’s own page when none of its projects opens for the person', () => {
		expect(organisationHomePathFor(organisation)).toBe('/organisations/harbour');
	});

	it('has no page to open for a client company reached only at the portal', () => {
		expect(organisationHomePathFor(clientCompany)).toBeNull();
	});
});
