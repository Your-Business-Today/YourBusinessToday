import { describe, expect, it } from 'vitest';
import { assignedElsewhere } from './assignedElsewhere';
import type { Department } from './department';
import type { TaskStatus } from './taskStatus';

const task = (id: string, department: Department, title: string, status: TaskStatus = 'backlog') => ({
	id,
	department,
	title,
	status,
	goalId: null,
	parentTaskId: null
});

const tasks = [
	task('dpa', 'administration', 'Sign the data processing agreement'),
	task('fix', 'development', 'FIX: the count says none'),
	task('story', 'development', 'Show the count'),
	task('old', 'administration', 'Agree the name', 'done')
];

describe('the viewer’s tasks on tabs the page is not showing', () => {
	it('names each other tab holding their open tasks, so "My move" never hides them', () => {
		const elsewhere = assignedElsewhere({ tasks, goals: [], assignedTaskIds: ['dpa', 'fix', 'old'], shownTabs: ['features'] });
		expect(elsewhere).toEqual([
			{ tab: 'bugs', label: 'Bugs', count: 1 },
			{ tab: 'administration', label: 'Administration', count: 1 }
		]);
	});

	it('names nothing when every task of theirs is on the tab shown', () => {
		expect(assignedElsewhere({ tasks, goals: [], assignedTaskIds: ['story'], shownTabs: ['features'] })).toEqual([]);
	});
});
