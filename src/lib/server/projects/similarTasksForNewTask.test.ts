import { describe, expect, it } from 'vitest';
import { isSimilarCheckSkipped, newTaskTexts } from './similarTasksForNewTask';
import type { NewTaskSeed } from './createTask';

const topLevelSeed: NewTaskSeed = {
	title: 'Export the fire door register',
	details: '',
	dueDate: null,
	parentTaskId: null,
	waitsForTaskId: null,
	goalId: null,
	kind: 'work'
};

describe('newTaskTexts', () => {
	it('compares a story by its title and what it wants', () => {
		const story = { role: 'a site manager', want: 'the fire door register exported', benefit: 'to send it on' };
		expect(newTaskTexts({ ...topLevelSeed, story })).toEqual(['Export the fire door register', 'the fire door register exported']);
	});

	it('compares a task without a story by its title alone', () => {
		expect(newTaskTexts(topLevelSeed)).toEqual(['Export the fire door register']);
		expect(newTaskTexts({ ...topLevelSeed, story: { role: 'a', want: '  ', benefit: 'b' } })).toEqual(['Export the fire door register']);
	});
});

describe('isSimilarCheckSkipped', () => {
	it('checks a top level task the person has not chosen to raise anyway', () => {
		expect(isSimilarCheckSkipped(topLevelSeed, false)).toBe(false);
	});

	it('skips a task raised anyway', () => {
		expect(isSimilarCheckSkipped(topLevelSeed, true)).toBe(true);
	});

	it('skips a subtask, a step of its own parent', () => {
		expect(isSimilarCheckSkipped({ ...topLevelSeed, parentTaskId: 'parent' }, false)).toBe(true);
	});
});
