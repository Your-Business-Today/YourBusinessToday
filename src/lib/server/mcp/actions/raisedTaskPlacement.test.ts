import { describe, expect, it } from 'vitest';
import { placementSentence } from './raisedTaskPlacement';
import type { NewTaskSeed } from '$lib/server/projects/createTask';

function seedWith(parentTaskId: string | null, goalId: string | null): NewTaskSeed {
	return { title: 'Send statements', details: '', parentTaskId, goalId } as unknown as NewTaskSeed;
}

describe('placementSentence', () => {
	it('counts the chunks a feature was raised with', () => {
		const family = { taskId: 'task-1', subtaskIds: ['a', 'b'] };
		expect(placementSentence(seedWith(null, 'goal-1'), family)).toBe(' With 2 subtasks, each a chunk of the same story.');
	});

	it('asks for the goal a top level task serves when it has none', () => {
		const family = { taskId: 'task-1', subtaskIds: [] };
		expect(placementSentence(seedWith(null, null), family)).toContain('find_goals');
	});

	it('says nothing of goals for a subtask, which sits under its parent', () => {
		const family = { taskId: 'task-1', subtaskIds: [] };
		expect(placementSentence(seedWith('parent-1', null), family)).toBe('');
	});
});
