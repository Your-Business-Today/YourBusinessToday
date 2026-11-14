import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTask } from './createTask';
import { departments } from '$lib/data/department';
import { doneTaskStatus, taskStatuses } from '$lib/data/taskStatus';
import { keepFinishedSubtasks } from './keepFinishedSubtasks';
import { reparentTask } from './reparentTask';
import { taskKinds } from '$lib/data/taskKind';
import { updateTaskStatus } from './updateTaskStatus';
import type { FamilyTask } from '$lib/data/taskDeletion';
import type { ProjectTask } from './taskRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

vi.mock('./createTask', () => ({ createTask: vi.fn() }));
vi.mock('./reparentTask', () => ({ reparentTask: vi.fn() }));
vi.mock('./updateTaskStatus', () => ({ updateTaskStatus: vi.fn() }));

const supabase = {} as SupabaseClient;
const story = {
	id: 'story',
	projectId: 'project-1',
	parentTaskId: 'epic',
	goalId: 'goal-1',
	kind: taskKinds.work,
	department: departments.development,
	title: 'Rods, reels and end tackle',
	status: taskStatuses.inProgress,
	storyRole: 'an angler',
	storyWant: 'to choose my rod',
	storyBenefit: 'I can fish the way I like'
} as ProjectTask;

const finishedNamed = (id: string): FamilyTask => ({ ...story, id, parentTaskId: story.id, status: doneTaskStatus });
const finishedSubtasks = [finishedNamed('branch-1'), finishedNamed('branch-2')];
const kept = { deletedTask: story, finishedSubtasks, completedParentTitle: 'Rods and reels shipped', keptByAccountId: 'me' };

describe('keeping the finished subtasks of a deleted task', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(createTask).mockResolvedValue('completed-parent');
	});

	it('raises the completed task where the deleted one stood, with its goal, department and story', async () => {
		await keepFinishedSubtasks(supabase, kept);
		const whereItStood = {
			title: 'Rods and reels shipped',
			details: 'Keeps the finished subtasks of "Rods, reels and end tackle", which was deleted.',
			dueDate: null,
			parentTaskId: 'epic',
			waitsForTaskId: null,
			goalId: 'goal-1',
			kind: taskKinds.work,
			department: departments.development,
			story: { role: 'an angler', want: 'to choose my rod', benefit: 'I can fish the way I like' }
		};
		expect(createTask).toHaveBeenCalledWith(supabase, 'project-1', whereItStood, 'me');
	});

	it('marks it done in the name of whoever deleted the task', async () => {
		await keepFinishedSubtasks(supabase, kept);
		expect(updateTaskStatus).toHaveBeenCalledWith(supabase, 'completed-parent', doneTaskStatus, 'me');
	});

	it('moves every finished subtask under it and answers with what it is', async () => {
		const completedParent = await keepFinishedSubtasks(supabase, kept);
		expect(reparentTask).toHaveBeenCalledTimes(finishedSubtasks.length);
		expect(reparentTask).toHaveBeenCalledWith(supabase, 'branch-1', 'completed-parent');
		expect(reparentTask).toHaveBeenCalledWith(supabase, 'branch-2', 'completed-parent');
		expect(completedParent).toEqual({ id: 'completed-parent', title: 'Rods and reels shipped' });
	});

	it('titles it as a bug fix when the deleted task was one, so its work stays a bug’s', async () => {
		const bug = { ...story, title: 'FIX: the rod snaps on the cast' };
		const completedParent = await keepFinishedSubtasks(supabase, { ...kept, deletedTask: bug });
		expect(completedParent.title).toBe('FIX: Rods and reels shipped');
	});
});
