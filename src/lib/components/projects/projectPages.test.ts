import { describe, expect, it } from 'vitest';
import { currentProjectPage, openProjectOn, projectPageLinks, projectPages, projectSwitchOptions, samePageInProject } from './projectPages';

const harbour = 'harbour-site';
const meadow = 'meadow-site';

function addressOf(path: string): URL {
	return new URL(path, 'https://portal.example');
}

describe('projectPageLinks', () => {
	it('gives a product Development, Task Management and its Domain', () => {
		const links = projectPageLinks(harbour);
		expect(links.map(({ label }) => label)).toEqual(['Development', 'Task Management', 'Domain']);
		expect(links[0].href).toBe('/projects/harbour-site');
		expect(links[1].href).toBe('/projects/harbour-site?department=administration');
		expect(links[2].href).toBe('/projects/harbour-site/domain');
	});

	it('gives an internal project its Task Management alone, since it has no code, domain or deploys', () => {
		expect(projectPageLinks(harbour, true).map(({ label }) => label)).toEqual(['Task Management']);
	});
});

describe('currentProjectPage', () => {
	it('puts the backlogs, the deploys and the site map under Development', () => {
		expect(currentProjectPage(harbour, addressOf('/projects/harbour-site'))).toBe(projectPages.development);
		expect(currentProjectPage(harbour, addressOf('/projects/harbour-site?department=bugs'))).toBe(projectPages.development);
		expect(currentProjectPage(harbour, addressOf('/projects/harbour-site/staged'))).toBe(projectPages.development);
		expect(currentProjectPage(harbour, addressOf('/projects/harbour-site/site-map'))).toBe(projectPages.development);
	});

	it('puts the team’s own departments under Task Management and the domain under Domain', () => {
		expect(currentProjectPage(harbour, addressOf('/projects/harbour-site?department=sales'))).toBe(projectPages.taskManagement);
		expect(currentProjectPage(harbour, addressOf('/projects/harbour-site/domain?entity=Task'))).toBe(projectPages.domain);
	});
});

describe('samePageInProject', () => {
	it('keeps the page when switching project', () => {
		expect(samePageInProject(harbour, addressOf('/projects/harbour-site/site-map?screen=%2F'), meadow)).toBe('/projects/meadow-site/site-map');
		expect(samePageInProject(harbour, addressOf('/projects/harbour-site?department=sales'), meadow)).toBe(
			'/projects/meadow-site?department=sales'
		);
	});

	it('lands on the board when switching from a task', () => {
		expect(samePageInProject(harbour, addressOf('/projects/harbour-site/tasks/one'), meadow)).toBe('/projects/meadow-site');
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
