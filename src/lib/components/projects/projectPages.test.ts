import { describe, expect, it } from 'vitest';
import { currentProjectPage, openProjectOn, projectPageLinks, projectSwitchOptions, samePageInProject } from './projectPages';

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
		expect(projectSwitchOptions([{ id: harbour, name: 'Harbour' }, ...projects], { id: harbour, name: 'Harbour' })).toHaveLength(2);
	});

	it('adds the open project when it sits under another organisation', () => {
		expect(projectSwitchOptions(projects, { id: harbour, name: 'Harbour' })[0]).toEqual({ id: harbour, name: 'Harbour' });
	});
});

describe('openProjectOn', () => {
	const project = { id: harbour, name: 'Harbour', organisationId: null, status: 'building' };
	const openProject = { id: harbour, name: 'Harbour', organisationId: null };

	it('finds the project on its board and on a page beneath it', () => {
		expect(openProjectOn('/projects/[projectId]', { project })).toEqual(openProject);
		expect(openProjectOn('/projects/[projectId]/tasks/[taskId]', { project })).toEqual(openProject);
	});

	it('finds none on the client portal, on the projects list or on a page that failed to load', () => {
		expect(openProjectOn('/portal/projects/[projectId]', { project })).toBeNull();
		expect(openProjectOn('/projects', {})).toBeNull();
		expect(openProjectOn(null, { project })).toBeNull();
		expect(openProjectOn('/projects/[projectId]', {})).toBeNull();
	});
});
