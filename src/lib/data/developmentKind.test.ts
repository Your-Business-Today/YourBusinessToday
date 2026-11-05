import { describe, expect, it } from 'vitest';
import {
	asBugTitle,
	developmentKindOfTask,
	parseDevelopmentKind,
	titleForDevelopmentKind
} from './developmentKind';

describe('a development task is a feature or a bug', () => {
	it('reads the kind named, singular or as the tab', () => {
		expect(parseDevelopmentKind('Bug')).toBe('bug');
		expect(parseDevelopmentKind('features')).toBe('feature');
		expect(parseDevelopmentKind('chore')).toBeNull();
	});

	it('titles a bug "FIX:" once', () => {
		expect(asBugTitle('invoice total is rounded up')).toBe('FIX: invoice total is rounded up');
		expect(asBugTitle('fix: invoice total is rounded up')).toBe('fix: invoice total is rounded up');
		expect(titleForDevelopmentKind('As a QS I want the grid', 'feature')).toBe('As a QS I want the grid');
	});

	it('takes a subtask’s kind from the task at the top of its tree', () => {
		const bug = { id: 'bug', parentTaskId: null, title: 'FIX: sign-in fails' };
		const step = { id: 'step', parentTaskId: 'bug', title: 'Write the test' };
		const tasksById = new Map([bug, step].map((task) => [task.id, task]));
		expect(developmentKindOfTask(step, tasksById)).toBe('bug');
	});
});
