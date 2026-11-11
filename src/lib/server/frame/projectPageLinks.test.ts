import { describe, expect, it } from 'vitest';
import { organisationHomePathFor, organisationPageLinksFor } from './projectPageLinks';

const projectId = '33333333-3333-4333-8333-333333333333';
const organisation = { id: 'harbour', name: 'Harbour Builders', organisationId: 'harbour', portalClientId: null };
const clientCompany = { ...organisation, portalClientId: 'harbour-client' };

describe('organisationPageLinksFor', () => {
	it('gives the people on an organisation its overview and its projects, and no project’s pages', () => {
		expect(organisationPageLinksFor(organisation, projectId)).toEqual([
			{ href: '/organisations/harbour', label: 'Overview' },
			{ href: '/projects', label: 'Projects' }
		]);
	});

	it('gives a client’s contact the picked project’s progress at the portal', () => {
		expect(organisationPageLinksFor(clientCompany, projectId)).toEqual([
			{ href: `/portal/projects/${projectId}`, label: 'Home' }
		]);
		expect(organisationPageLinksFor(clientCompany, null)).toEqual([]);
	});
});

describe('organisationHomePathFor', () => {
	it('opens an organisation on its projects', () => {
		expect(organisationHomePathFor(organisation, projectId)).toBe('/projects');
	});

	it('opens a client company on its picked project at the portal, or nowhere when none is picked', () => {
		expect(organisationHomePathFor(clientCompany, projectId)).toBe(`/portal/projects/${projectId}`);
		expect(organisationHomePathFor(clientCompany, null)).toBeNull();
	});
});
