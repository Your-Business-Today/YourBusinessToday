import { describe, expect, it } from 'vitest';
import { currentProjectPage, projectPageLinks, projectSwitchOptions, samePageInProject } from './projectBar';

const harbour = 'harbour-site';
const meadow = 'meadow-site';

describe('projectPageLinks', () => {
	it('opens the board first, then the project’s domain, site map and deploys', () => {
		const links = projectPageLinks(harbour);
		expect(links.map(({ label }) => label)).toEqual(['Board', 'Domain', 'Site map', 'Deployment history']);
		expect(links[0].href).toBe('/projects/harbour-site');
		expect(links[3].href).toBe('/projects/harbour-site/deploys');
	});
});

describe('currentProjectPage', () => {
	it('puts a task opened from the board under the board, and the site map under its own tab', () => {
		expect(currentProjectPage(harbour, '/projects/harbour-site/tasks/one')?.label).toBe('Board');
		expect(currentProjectPage(harbour, '/projects/harbour-site/site-map')?.label).toBe('Site map');
	});
});

describe('samePageInProject', () => {
	it('keeps the tab when switching project', () => {
		expect(samePageInProject(harbour, '/projects/harbour-site/site-map', meadow)).toBe('/projects/meadow-site/site-map');
	});

	it('lands on the board when switching from a task', () => {
		expect(samePageInProject(harbour, '/projects/harbour-site/tasks/one', meadow)).toBe('/projects/meadow-site');
	});
});

describe('projectSwitchOptions', () => {
	const projects = [{ id: meadow, name: 'Meadow' }];

	it('offers the organisation’s projects', () => {
		expect(projectSwitchOptions([{ id: harbour, name: 'Harbour' }, ...projects], harbour, 'Harbour')).toHaveLength(2);
	});

	it('adds the open project when it sits under another organisation', () => {
		expect(projectSwitchOptions(projects, harbour, 'Harbour')[0]).toEqual({ id: harbour, name: 'Harbour' });
	});
});
