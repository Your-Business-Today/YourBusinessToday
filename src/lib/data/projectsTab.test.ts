import { describe, expect, it } from 'vitest';
import {
	cookieRememberingTab,
	priorityTasksTab,
	rememberedProjectsTab,
	statusFilterOfTab,
	statusOnFirstVisit
} from './projectsTab';
import type { ProjectStatus } from './projectStatus';

const projectsIn = (...statuses: ProjectStatus[]) => statuses.map((status) => ({ status }));

describe('the tab the Projects page opens on the first time', () => {
	it('is Building when it holds more projects than Scoping', () => {
		expect(statusOnFirstVisit(projectsIn('scoping', 'building', 'building'))).toBe('building');
	});

	it('is Scoping when it holds more projects than Building', () => {
		expect(statusOnFirstVisit(projectsIn('scoping', 'scoping', 'building', 'on_hold'))).toBe('scoping');
	});

	it('is Scoping when the two are level, and when neither holds a project', () => {
		expect(statusOnFirstVisit(projectsIn('scoping', 'building'))).toBe('scoping');
		expect(statusOnFirstVisit(projectsIn('on_hold', 'complete'))).toBe('scoping');
		expect(statusOnFirstVisit([])).toBe('scoping');
	});
});

describe('the tab a person last had the Projects page on', () => {
	it('is remembered when it is Priority tasks or a status', () => {
		expect(rememberedProjectsTab(priorityTasksTab)).toBe(priorityTasksTab);
		expect(rememberedProjectsTab('on_hold')).toBe('on_hold');
		expect(rememberedProjectsTab('all')).toBe('all');
	});

	it('is forgotten when nothing was kept, or what was kept names no tab', () => {
		expect(rememberedProjectsTab(undefined)).toBeNull();
		expect(rememberedProjectsTab('open')).toBeNull();
		expect(rememberedProjectsTab('<script>')).toBeNull();
	});

	it('is kept for a year, for the Projects page alone', () => {
		expect(cookieRememberingTab('building')).toBe('projects_tab=building; path=/projects; max-age=31536000; samesite=lax');
	});
});

describe('the status a tab stands for', () => {
	it('is the status itself, and none for Priority tasks', () => {
		expect(statusFilterOfTab('testing')).toBe('testing');
		expect(statusFilterOfTab(priorityTasksTab)).toBeNull();
		expect(statusFilterOfTab(null)).toBeNull();
	});
});
