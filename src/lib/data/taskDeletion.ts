import { isTaskDone, type TaskStatus } from './taskStatus';
import type { TaskKind } from './taskKind';

/** A task as the tree it sits in shows it: where it hangs, what it is called and where it stands. */
export type FamilyTask = { id: string; parentTaskId: string | null; kind: TaskKind; title: string; status: TaskStatus };

/**
 * What deleting a task does to the subtasks under it. Finished work is never deleted: each finished subtask is
 * kept, with whatever is under it, and moved under a new completed task. The open subtasks are deleted with it.
 */
export type TaskDeletionPlan<Task extends FamilyTask = FamilyTask> = {
	task: Task;
	finishedSubtasks: FamilyTask[];
	openSubtasks: FamilyTask[];
};

/** What whoever asks for the deletion decides: what the completed task is called, and that the open subtasks go. */
export type TaskDeletionChoices = { completedParentTitle: string | null; shouldDeleteOpenSubtasks: boolean };

/** What each choice is called where it is asked for: on the site's form and in the connector's inputs. */
export const taskDeletionInputs = {
	keepFinishedUnderTitle: 'keepFinishedUnderTitle',
	deleteOpenSubtasks: 'deleteOpenSubtasks'
} as const;

export const taskDeletionRefusals = {
	taskIsFinished: 'task_is_finished',
	subtasksUndecided: 'subtasks_undecided'
} as const;

export type TaskDeletionRefusal = (typeof taskDeletionRefusals)[keyof typeof taskDeletionRefusals];

export function planTaskDeletion<Task extends FamilyTask>(task: Task, descendants: FamilyTask[]): TaskDeletionPlan<Task> {
	const openSubtasks = openSubtasksUnder(task, descendants);
	const deletedTasks = [task, ...openSubtasks];
	const finishedSubtasks = deletedTasks.flatMap((deleted) => subtasksOf(deleted, descendants).filter(isFinished));
	return { task, finishedSubtasks, openSubtasks };
}

/** Why the deletion does not go ahead as asked, or null when it does. */
export function taskDeletionRefusal(plan: TaskDeletionPlan, choices: TaskDeletionChoices): TaskDeletionRefusal | null {
	if (isFinished(plan.task)) return taskDeletionRefusals.taskIsFinished;
	if (!isEverySubtaskDecided(plan, choices)) return taskDeletionRefusals.subtasksUndecided;
	return null;
}

export const finishedTaskStays = (task: FamilyTask): string =>
	`"${task.title}" is finished, so it stays as the record of the work and is not deleted.`;

/** What stays of a task once it is deleted, by itself or with its whole project. */
export const whatIsKeptOfDeletedTask =
	'A copy of each deleted task is kept on the record of deletions, with its conversation and history: ' +
	'list_task_deletions lists them and read_task_deletion reads one. Its attached files are not kept.';

function isEverySubtaskDecided(plan: TaskDeletionPlan, choices: TaskDeletionChoices): boolean {
	const { finishedSubtasks, openSubtasks } = plan;
	const hasHomeForFinishedWork = finishedSubtasks.length === 0 || choices.completedParentTitle !== null;
	const hasWordOnOpenSubtasks = openSubtasks.length === 0 || choices.shouldDeleteOpenSubtasks;
	return hasHomeForFinishedWork && hasWordOnOpenSubtasks;
}

/** The open subtasks under a task at every depth, stopping at each finished one: what is under it stays with it. */
function openSubtasksUnder(parent: FamilyTask, family: FamilyTask[]): FamilyTask[] {
	const openChildren = subtasksOf(parent, family).filter((subtask) => !isFinished(subtask));
	return openChildren.flatMap((subtask) => [subtask, ...openSubtasksUnder(subtask, family)]);
}

function subtasksOf(parent: FamilyTask, family: FamilyTask[]): FamilyTask[] {
	return family.filter((member) => member.parentTaskId === parent.id);
}

function isFinished(task: FamilyTask): boolean {
	return isTaskDone(task.status);
}
