import { describe, expect, it } from 'vitest';
import { finishedTaskStays, planTaskDeletion, taskDeletionRefusal, taskDeletionRefusals, type FamilyTask } from './taskDeletion';
import { taskKinds } from './taskKind';
import { taskStatuses, type TaskStatus } from './taskStatus';

const { backlog, done, inProgress, onHold } = taskStatuses;

const taskNamed = (id: string, parentTaskId: string | null, status: TaskStatus): FamilyTask => ({
	id,
	parentTaskId,
	kind: taskKinds.work,
	title: `Task ${id}`,
	status
});

const story = taskNamed('story', null, inProgress);
const finishedBranch = taskNamed('finished', story.id, done);
const openBranch = taskNamed('open', story.id, backlog);
const heldBranch = taskNamed('held', story.id, onHold);
const finishedUnderOpen = taskNamed('finished-under-open', openBranch.id, done);
const openUnderOpen = taskNamed('open-under-open', openBranch.id, inProgress);
const openUnderFinished = taskNamed('open-under-finished', finishedBranch.id, backlog);
const family = [finishedBranch, openBranch, heldBranch, finishedUnderOpen, openUnderOpen, openUnderFinished];

const idsOf = (tasks: FamilyTask[]) => tasks.map((task) => task.id);
const nothingDecided = { completedParentTitle: null, shouldDeleteOpenSubtasks: false };
const everythingDecided = { completedParentTitle: 'Rods and reels shipped', shouldDeleteOpenSubtasks: true };

describe('planTaskDeletion', () => {
	const plan = planTaskDeletion(story, family);

	it('keeps every finished subtask, at any depth under the open ones', () => {
		expect(idsOf(plan.finishedSubtasks)).toEqual([finishedBranch.id, finishedUnderOpen.id]);
	});

	it('deletes the open subtasks at every depth, whatever their open status', () => {
		expect(idsOf(plan.openSubtasks)).toEqual([openBranch.id, openUnderOpen.id, heldBranch.id]);
	});

	it('leaves what is under a finished subtask with it, neither deleted nor moved', () => {
		const touchedIds = idsOf([...plan.finishedSubtasks, ...plan.openSubtasks]);
		expect(touchedIds).not.toContain(openUnderFinished.id);
	});

	it('finds nothing to keep or delete under a task with no subtasks', () => {
		const lonePlan = planTaskDeletion(heldBranch, family);
		expect(lonePlan).toEqual({ task: heldBranch, finishedSubtasks: [], openSubtasks: [] });
	});
});

describe('taskDeletionRefusal', () => {
	const plan = planTaskDeletion(story, family);

	it('refuses to delete a finished task, whatever was decided', () => {
		const finishedPlan = planTaskDeletion(finishedBranch, family);
		expect(taskDeletionRefusal(finishedPlan, everythingDecided)).toBe(taskDeletionRefusals.taskIsFinished);
	});

	it('refuses while the finished subtasks have no completed task to go under', () => {
		const choices = { ...everythingDecided, completedParentTitle: null };
		expect(taskDeletionRefusal(plan, choices)).toBe(taskDeletionRefusals.subtasksUndecided);
	});

	it('refuses while nobody has said the open subtasks are to be deleted', () => {
		const choices = { ...everythingDecided, shouldDeleteOpenSubtasks: false };
		expect(taskDeletionRefusal(plan, choices)).toBe(taskDeletionRefusals.subtasksUndecided);
	});

	it('goes ahead once both are decided', () => {
		expect(taskDeletionRefusal(plan, everythingDecided)).toBeNull();
	});

	it('needs nothing decided for a task with no subtasks', () => {
		expect(taskDeletionRefusal(planTaskDeletion(heldBranch, family), nothingDecided)).toBeNull();
	});

	it('needs only the completed task named when every subtask is finished', () => {
		const allFinished = planTaskDeletion(openBranch, [finishedUnderOpen]);
		expect(taskDeletionRefusal(allFinished, nothingDecided)).toBe(taskDeletionRefusals.subtasksUndecided);
		expect(taskDeletionRefusal(allFinished, { ...nothingDecided, completedParentTitle: 'Shipped' })).toBeNull();
	});
});

describe('finishedTaskStays', () => {
	it('names the task and says why it is not deleted', () => {
		expect(finishedTaskStays(finishedBranch)).toBe(
			'"Task finished" is finished, so it stays as the record of the work and is not deleted.'
		);
	});
});
