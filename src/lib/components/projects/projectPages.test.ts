import { describe, expect, it } from 'vitest';
import { currentProjectPage, openProjectOn, projectPageLinks, projectPages, projectSwitchOptions, samePageInProject } from './projectPages';

const harbour = 'harbour-site';
const meadow = 'meadow-site';

function addressOf(path: string): URL {
	return new URL(path, 'https://portal.example');
}

describe('projectPageLinks', () => {
	it('gives a product Development, Task Management, its Videos, its Documents and its Workflow map', () => {
		const links = projectPageLinks(harbour);
		expect(links.map(({ label }) => label)).toEqual(['Development', 'Task Management', 'Videos', 'Documents', 'Workflow map']);
		expect(links[0].href).toBe('/projects/harbour-site');
		expect(links[1].href).toBe('/projects/harbour-site?department=administration');
		expect(links[2].href).toBe('/projects/harbour-site/videos');
		expect(links[3].href).toBe('/projects/harbour-site/documents');
		expect(links[4].href).toBe('/projects/harbour-site/workflow-map');
	});

	it('gives an internal project its Task Management and Documents alone, since it has no code, domain or deploys', () => {
		expect(projectPageLinks(harbour, true).map(({ label }) => label)).toEqual(['Task Management', 'Documents']);
	});

	it('leaves Task Management off a product under an organisation, whose Tasks page holds the team’s jobs', () => {
		expect(projectPageLinks(harbour, false, true).map(({ label }) => label)).toEqual(['Development', 'Videos', 'Documents', 'Workflow map']);
	});
});

describe('currentProjectPage', () => {
	it('puts the backlogs, the deploys and the site map under Development', () => {
		expect(currentProjectPage(harbour, addressOf('/projects/harbour-site'))).toBe(projectPages.development);
		expect(currentProjectPage(harbour, addressOf('/projects/harbour-site?department=bugs'))).toBe(projectPages.development);
		expect(currentProjectPage(harbour, addressOf('/projects/harbour-site/staged'))).toBe(projectPages.development);
		expect(currentProjectPage(harbour, addressOf('/projects/harbour-site/site-map'))).toBe(projectPages.development);
	});

	it('puts the team’s own departments under Task Management and the map under Workflow map', () => {
		expect(currentProjectPage(harbour, addressOf('/projects/harbour-site?department=sales'))).toBe(projectPages.taskManagement);
		expect(currentProjectPage(harbour, addressOf('/projects/harbour-site/workflow-map'))).toBe(projectPages.workflowMap);
	});

	it('puts the documents, and one open to read, under Documents', () => {
		expect(currentProjectPage(harbour, addressOf('/projects/harbour-site/documents'))).toBe(projectPages.documents);
		expect(currentProjectPage(harbour, addressOf('/projects/harbour-site/documents/one'))).toBe(projectPages.documents);
	});

	it('puts the tutorial videos, and a video on screen, under Videos', () => {
		expect(currentProjectPage(harbour, addressOf('/projects/harbour-site/videos'))).toBe(projectPages.videos);
		expect(currentProjectPage(harbour, addressOf('/projects/harbour-site/videos?watch=one'))).toBe(projectPages.videos);
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
