import { describe, expect, it } from 'vitest';
import {
	autocompleteRegisterHref,
	goalsShown,
	hasEntriesShown,
	ownSettingTasksShown,
	parseAutocompleteRegisterFilter
} from './autocompleteRegisterFilter';
import type { RegisterProject } from './autocompleteRegister';

const project: RegisterProject = {
	id: 'project-1',
	name: 'Project',
	goals: [
		{ id: 'goal-on', title: 'Goal on', isAutocomplete: true },
		{ id: 'goal-off', title: 'Goal off', isAutocomplete: false }
	],
	tasks: [
		{ id: 'task-follows', title: 'Follows', goalId: 'goal-on', setting: null, isAutocomplete: true },
		{ id: 'task-off', title: 'Own off', goalId: 'goal-on', setting: false, isAutocomplete: false }
	]
};

const offOnlyProject: RegisterProject = { ...project, goals: [project.goals[1]] };

describe('autocompleteRegisterFilter', () => {
	it('falls back to autocomplete on for anything unknown', () => {
		expect(parseAutocompleteRegisterFilter(null)).toBe('on');
		expect(parseAutocompleteRegisterFilter('everything')).toBe('on');
		expect(parseAutocompleteRegisterFilter('off')).toBe('off');
		expect(parseAutocompleteRegisterFilter('all')).toBe('all');
	});

	it('keeps autocomplete on at the bare path', () => {
		expect(autocompleteRegisterHref('on')).toBe('/projects/autocomplete');
		expect(autocompleteRegisterHref('off')).toBe('/projects/autocomplete?autocomplete=off');
	});

	it('shows only the goals and own-setting tasks that match', () => {
		expect(goalsShown(project, 'on').map((goal) => goal.id)).toEqual(['goal-on']);
		expect(ownSettingTasksShown(project, 'on')).toEqual([]);
		expect(ownSettingTasksShown(project, 'off').map((task) => task.id)).toEqual(['task-off']);
		expect(goalsShown(project, 'all')).toHaveLength(2);
	});

	it('hides a project with nothing on unless every entry is asked for', () => {
		expect(hasEntriesShown(offOnlyProject, 'on')).toBe(false);
		expect(hasEntriesShown(offOnlyProject, 'off')).toBe(true);
		expect(hasEntriesShown({ ...project, goals: [], tasks: [] }, 'all')).toBe(true);
	});
});
