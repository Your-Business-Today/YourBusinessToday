import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectListView, type ProjectListRow } from './projectListView.svelte';
import { priorityTasksTab } from '$lib/data/projectsTab';
import type { ProjectStatus } from '$lib/data/projectStatus';
import type { ListedProject } from '$lib/server/projects/getProjectsForUser';

function project(name: string, status: ProjectStatus, isYours = true): ListedProject {
	return { id: name, name, status, isYours, openTaskCount: 1 } as unknown as ListedProject;
}

const projects = [
	project('Carp Mania', 'building'),
	project('YBT App', 'building'),
	project('LifeCV', 'scoping'),
	project('Parked Idea', 'on_hold')
];

const browser = { cookie: '' };

function listViewRemembering(rememberedTab: string | null): ProjectListView {
	return new ProjectListView(() => projects, rememberedTab);
}

describe('the tab the Projects page opens on', () => {
	beforeEach(() => vi.stubGlobal('document', browser));
	afterEach(() => vi.unstubAllGlobals());

	it('is the busier of Scoping and Building the first time', () => {
		const listView = listViewRemembering(null);
		expect(listView.selectedTab).toBe('building');
		expect(listView.filteredProjects.map((shown) => shown.name)).toEqual(['Carp Mania', 'YBT App']);
	});

	it('is the tab the person last had it on', () => {
		const listView = listViewRemembering('on_hold');
		expect(listView.selectedTab).toBe('on_hold');
		expect(listView.filteredProjects.map((shown) => shown.name)).toEqual(['Parked Idea']);
	});

	it('keeps the first visit’s status behind Priority tasks, for when nothing waits any more', () => {
		const listView = listViewRemembering(priorityTasksTab);
		expect(listView.selectedTab).toBe(priorityTasksTab);
		expect(listView.selectedStatus).toBe('building');
	});

	it('remembers the tab a person chooses', () => {
		const listView = listViewRemembering(null);
		listView.selectedTab = 'scoping';
		expect(browser.cookie).toContain('projects_tab=scoping;');
		expect(listView.selectedStatus).toBe('scoping');
	});
});

describe('the arrows on a row of the Projects list', () => {
	beforeEach(() => vi.stubGlobal('document', browser));
	afterEach(() => vi.unstubAllGlobals());

	const upArrow = (row: ProjectListRow) => (row.isFirst ? [] : ['up']);
	const downArrow = (row: ProjectListRow) => (row.isLast ? [] : ['down']);
	const arrowsOf = (listView: ProjectListView) =>
		listView.pagedRows.map((row) => [row.position, ...upArrow(row), ...downArrow(row)].join(' '));

	it('lets the one project a person owns on a tab move down past the ones others own', () => {
		const scoping = [
			project('Florist site', 'scoping'),
			project('LifeCV', 'scoping', false),
			project('Skill swap', 'scoping', false)
		];
		const listView = new ProjectListView(() => scoping, 'scoping');
		expect(arrowsOf(listView)).toEqual(['1 down', '2 up down', '3 up']);
	});

	it('counts the rows of every page, so a page’s edge is not the list’s', () => {
		const building = Array.from({ length: 21 }, (_, index) => project(`Project ${index + 1}`, 'building'));
		const listView = new ProjectListView(() => building, 'building');
		expect(arrowsOf(listView).at(-1)).toBe('20 up down');
		listView.pageNumber = 2;
		expect(arrowsOf(listView)).toEqual(['21 up']);
	});

	it('gives no arrow to a project alone on its tab', () => {
		const listView = new ProjectListView(() => projects, 'on_hold');
		expect(arrowsOf(listView)).toEqual(['1']);
	});
});
