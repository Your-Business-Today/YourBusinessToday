import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectListView } from './projectListView.svelte';
import { priorityTasksTab } from '$lib/data/projectsTab';
import type { ProjectStatus } from '$lib/data/projectStatus';
import type { ListedProject } from '$lib/server/projects/getProjectsForUser';

function project(name: string, status: ProjectStatus): ListedProject {
	return { id: name, name, status, openTaskCount: 1 } as unknown as ListedProject;
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
