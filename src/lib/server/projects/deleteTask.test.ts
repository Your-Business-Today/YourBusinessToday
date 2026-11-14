import { beforeEach, describe, expect, it, vi } from 'vitest';
import { deleteTask } from './deleteTask';
import { deleteTasksTogether } from './deleteTasksTogether';
import { getDescendantsOfTask } from './getDescendantsOfTask';
import { keepFinishedSubtasks } from './keepFinishedSubtasks';
import { taskDeletionRefusals, type FamilyTask } from '$lib/data/taskDeletion';
import { taskKinds } from '$lib/data/taskKind';
import { taskStatuses, type TaskStatus } from '$lib/data/taskStatus';
import type { ProjectTask } from './taskRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

vi.mock('./deleteTasksTogether', () => ({ deleteTasksTogether: vi.fn() }));
vi.mock('./getDescendantsOfTask', () => ({ getDescendantsOfTask: vi.fn() }));
vi.mock('./keepFinishedSubtasks', () => ({ keepFinishedSubtasks: vi.fn() }));

const supabase = {} as SupabaseClient;
const { backlog, done, inProgress } = taskStatuses;

const subtaskUnder = (parentTaskId: string, id: string, status: TaskStatus): FamilyTask => ({
	id,
	parentTaskId,
	kind: taskKinds.work,
	title: `Task ${id}`,
	status
});

const story = { ...subtaskUnder('', 'story', inProgress), parentTaskId: null, projectId: 'project-1' } as ProjectTask;
const shipped = subtaskUnder(story.id, 'shipped', done);
const unbuilt = subtaskUnder(story.id, 'unbuilt', backlog);
const shippedUnderUnbuilt = subtaskUnder(unbuilt.id, 'shipped-under-unbuilt', done);
const completedParent = { id: 'completed-parent', title: 'Rods shipped' };
const everythingDecided = { completedParentTitle: 'Rods shipped', shouldDeleteOpenSubtasks: true, deletedByAccountId: 'me' };
const nothingDecided = { ...everythingDecided, completedParentTitle: null, shouldDeleteOpenSubtasks: false };
const finishedWorkKept = 'finished work kept';
const tasksDeleted = 'tasks deleted';

describe('deleting a task', () => {
	const steps: string[] = [];

	beforeEach(() => {
		steps.length = 0;
		vi.mocked(getDescendantsOfTask).mockResolvedValue([shipped, unbuilt, shippedUnderUnbuilt]);
		vi.mocked(keepFinishedSubtasks).mockReset();
		vi.mocked(keepFinishedSubtasks).mockImplementation(async () => {
			steps.push(finishedWorkKept);
			return completedParent;
		});
		vi.mocked(deleteTasksTogether).mockReset();
		vi.mocked(deleteTasksTogether).mockImplementation(async () => {
			steps.push(tasksDeleted);
		});
	});

	it('deletes nothing and moves nothing until the subtasks are decided, and answers with the plan', async () => {
		const { plan, refusal } = await deleteTask(supabase, story, nothingDecided);
		expect(refusal).toBe(taskDeletionRefusals.subtasksUndecided);
		expect(plan.finishedSubtasks).toEqual([shipped, shippedUnderUnbuilt]);
		expect(plan.openSubtasks).toEqual([unbuilt]);
		expect(steps).toEqual([]);
	});

	it('refuses a finished task, whatever was decided', async () => {
		const { refusal } = await deleteTask(supabase, { ...story, status: done }, everythingDecided);
		expect(refusal).toBe(taskDeletionRefusals.taskIsFinished);
		expect(steps).toEqual([]);
	});

	it('moves the finished subtasks under the completed task before anything is deleted', async () => {
		const outcome = await deleteTask(supabase, story, everythingDecided);
		expect(steps).toEqual([finishedWorkKept, tasksDeleted]);
		const kept = {
			deletedTask: story,
			finishedSubtasks: [shipped, shippedUnderUnbuilt],
			completedParentTitle: 'Rods shipped',
			keptByAccountId: 'me'
		};
		expect(keepFinishedSubtasks).toHaveBeenCalledWith(supabase, kept);
		expect(outcome.completedParent).toEqual(completedParent);
	});

	it('deletes the task and its open subtasks by name, and never names a finished one', async () => {
		await deleteTask(supabase, story, everythingDecided);
		const named = { projectId: 'project-1', taskIds: [story.id, unbuilt.id], deletedByAccountId: 'me' };
		expect(deleteTasksTogether).toHaveBeenCalledWith(supabase, named);
	});

	it('deletes a task with nothing under it at once, and makes no completed task', async () => {
		vi.mocked(getDescendantsOfTask).mockResolvedValue([]);
		const { completedParent: madeParent, refusal } = await deleteTask(supabase, story, nothingDecided);
		expect(refusal).toBeNull();
		expect(madeParent).toBeNull();
		expect(steps).toEqual([tasksDeleted]);
	});

	it('leaves the task where it is when the finished work cannot be moved', async () => {
		vi.mocked(keepFinishedSubtasks).mockRejectedValue(new Error('refused'));
		await expect(deleteTask(supabase, story, everythingDecided)).rejects.toThrow('refused');
		expect(steps).toEqual([]);
	});
});
