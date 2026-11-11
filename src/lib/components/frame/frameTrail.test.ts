import { describe, expect, it } from 'vitest';
import { frameTrailTo } from './frameTrail';
import type { FramePicks } from './framePicks';

const overview = { href: '/organisations/harbour', label: 'Overview' };
const projects = { href: '/projects', label: 'Projects' };
const books = { href: '/organisations/harbour/books', label: 'Books' };
const clients = { href: '/clients', label: 'Clients' };
const harbourCrumb = { href: overview.href, label: 'Harbour Builders' };

const picks: FramePicks = {
	organisations: [
		{ id: 'harbour', name: 'Harbour Builders' },
		{ id: 'meadow', name: 'Meadow Homes' }
	],
	pickedOrganisationId: 'harbour',
	projects: [],
	pickedProjectId: null,
	organisationLinks: [overview, projects],
	moduleLinks: [books],
	homePath: projects.href
};

const harbourSite = { id: 'harbour-site', name: 'Harbour site', organisationId: 'harbour' };
const meadowSite = { id: 'meadow-site', name: 'Meadow site', organisationId: 'meadow' };

describe('frameTrailTo', () => {
	it('leads to the picked organisation’s pages and modules by the organisation', () => {
		expect(frameTrailTo(projects, picks, null)).toEqual({ crumbs: [harbourCrumb], heading: 'Projects' });
		expect(frameTrailTo(books, picks, null)).toEqual({ crumbs: [harbourCrumb], heading: 'Books' });
	});

	it('heads a page that is nobody’s organisation with its section alone', () => {
		expect(frameTrailTo(clients, picks, null)).toEqual({ crumbs: [], heading: 'Clients' });
		expect(frameTrailTo(projects, null, null)).toEqual({ crumbs: [], heading: 'Projects' });
	});

	it('leaves the heading to the switcher on a project’s page, after the organisation and the section', () => {
		expect(frameTrailTo(projects, picks, harbourSite)).toEqual({ crumbs: [harbourCrumb, projects], heading: null });
	});

	it('does not name the picked organisation over a project that sits elsewhere', () => {
		expect(frameTrailTo(projects, picks, meadowSite)).toEqual({ crumbs: [projects], heading: null });
	});

	it('falls back to the company name where no section holds the page', () => {
		expect(frameTrailTo(undefined, picks, null)).toEqual({ crumbs: [], heading: 'Your Business Today' });
	});
});
