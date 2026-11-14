import { describe, expect, it } from 'vitest';
import { subtaskLine, taskFamilyLines } from './describeTaskFamily';
import { taskKinds } from '$lib/data/taskKind';
import { taskStatuses } from '$lib/data/taskStatus';
import type { FamilyTask } from '$lib/data/taskDeletion';

const story: FamilyTask = {
	id: 'story',
	parentTaskId: null,
	kind: taskKinds.work,
	title: 'Rods and reels',
	status: taskStatuses.inProgress
};
const shipped: FamilyTask = { ...story, id: 'branch-1', parentTaskId: story.id, title: 'Branch 1', status: taskStatuses.done };
const unbuilt: FamilyTask = { ...shipped, id: 'branch-3', title: 'Branch 3', status: taskStatuses.backlog };

describe('where read_task says a task sits in its tree', () => {
	it('lists the subtasks under it, each with where it stands and its id', () => {
		expect(taskFamilyLines({ parentTask: null, subtasks: [shipped, unbuilt] })).toEqual([
			'Subtasks:',
			'- "Branch 1" (Done, task id: branch-1)',
			'- "Branch 3" (Backlog, task id: branch-3)'
		]);
	});

	it('says so when it has none, so nobody has to guess what deleting it would take', () => {
		expect(taskFamilyLines({ parentTask: null, subtasks: [] })).toEqual(['Subtasks: none.']);
	});

	it('names the task a subtask is under', () => {
		const lines = taskFamilyLines({ parentTask: story, subtasks: [] });
		expect(lines).toEqual(['Subtask of: "Rods and reels" (task id: story)', 'Subtasks: none.']);
	});

	it('words a support task’s standing the way support does', () => {
		const answered = { ...shipped, kind: taskKinds.support };
		expect(subtaskLine(answered)).toBe('- "Branch 1" (Resolved, task id: branch-1)');
	});
});
