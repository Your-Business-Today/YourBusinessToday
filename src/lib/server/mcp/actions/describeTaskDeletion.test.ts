import { describe, expect, it } from 'vitest';
import { describeTaskDeletion } from './describeTaskDeletion';
import { taskDeletionRefusals, type FamilyTask } from '$lib/data/taskDeletion';
import { taskKinds } from '$lib/data/taskKind';
import { taskStatuses, type TaskStatus } from '$lib/data/taskStatus';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

const { backlog, done, inProgress } = taskStatuses;
const { subtasksUndecided, taskIsFinished } = taskDeletionRefusals;

const titled = (id: string, title: string, status: TaskStatus): FamilyTask => ({
	id,
	parentTaskId: 'story',
	kind: taskKinds.work,
	title,
	status
});

const story = titled('story', 'Rods and reels', inProgress) as ProjectTask;
const named = `"${story.title}"`;
const shipped = titled('branch-1', 'Branch 1: the rod bends', done);
const unbuilt = titled('branch-3', 'Branch 3: end tackle', backlog);
const nothingUnderIt = { task: story, finishedSubtasks: [], openSubtasks: [] };
const bothKindsUnderIt = { task: story, finishedSubtasks: [shipped], openSubtasks: [unbuilt] };
const completedParent = { id: 'kept', title: 'Rods and reels shipped' };
const copyIsKept =
	'A copy of each deleted task is kept on the record of deletions, with its conversation and history: ' +
	'list_task_deletions lists them, read_task_deletion reads one and put_back_deleted_task puts one back. ' +
	'Its attached files are not kept.';

describe('what delete_task answers', () => {
	it('says a finished task stays, and how to move it back when it was marked done by mistake', () => {
		const finished = { ...nothingUnderIt, task: { ...story, status: done } };
		const answer = describeTaskDeletion({ plan: finished, refusal: taskIsFinished, completedParent: null });
		expect(answer).toBe(
			`${named} is finished, so it stays as the record of the work and is not deleted. ` +
				'If it was marked done by mistake, move it back with update_task_status first.'
		);
	});

	it('lists what would be kept and what would go before anything is deleted, and what to say to go ahead', () => {
		const answer = describeTaskDeletion({ plan: bothKindsUnderIt, refusal: subtasksUndecided, completedParent: null });
		expect(answer.split('\n')).toEqual([
			`Nothing is deleted yet. ${named} has subtasks, and deleting it would do this:`,
			'Keep one finished subtask, moved under a new completed task in its place:',
			'- "Branch 1: the rod bends" (Done, task id: branch-1)',
			'Delete one open subtask, conversation and history included:',
			'- "Branch 3: end tackle" (Backlog, task id: branch-3)',
			'To keep one of them, move it out first with set_task_parent.',
			'To go ahead, call delete_task again with keepFinishedUnderTitle, naming the completed task for the work ' +
				'those subtasks finished, and deleteOpenSubtasks true, once the person has seen this list.'
		]);
	});

	it('asks only for the word on the open subtasks when none under it is finished', () => {
		const onlyOpen = { ...bothKindsUnderIt, finishedSubtasks: [] };
		const answer = describeTaskDeletion({ plan: onlyOpen, refusal: subtasksUndecided, completedParent: null });
		expect(answer).not.toContain('Keep ');
		expect(answer).toContain('call delete_task again with deleteOpenSubtasks true, once the person has seen this list.');
	});

	it('says a task with nothing under it is deleted, and that a copy is kept', () => {
		const answer = describeTaskDeletion({ plan: nothingUnderIt, refusal: null, completedParent: null });
		expect(answer.split('\n')).toEqual([`${named} deleted.`, copyIsKept]);
	});

	it('names every subtask that went and every one kept, and the completed task they are kept under', () => {
		const answer = describeTaskDeletion({ plan: bothKindsUnderIt, refusal: null, completedParent });
		expect(answer.split('\n')).toEqual([
			`${named} deleted, along with one open subtask:`,
			'- "Branch 3: end tackle" (Backlog, task id: branch-3)',
			'Kept, under the new completed task "Rods and reels shipped" (task id: kept): one finished subtask:',
			'- "Branch 1: the rod bends" (Done, task id: branch-1)',
			copyIsKept
		]);
	});
});
