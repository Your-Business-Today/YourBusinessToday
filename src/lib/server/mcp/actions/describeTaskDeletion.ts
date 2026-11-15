import { countOf } from '$lib/data/countOf';
import { finishedTaskStays, taskDeletionInputs, taskDeletionRefusals } from '$lib/data/taskDeletion';
import type { FamilyTask, TaskDeletionPlan } from '$lib/data/taskDeletion';
import { subtaskLine } from './describeTaskFamily';
import type { CompletedParent } from '$lib/server/projects/keepFinishedSubtasks';
import type { TaskDeletionOutcome } from '$lib/server/projects/deleteTask';

const { keepFinishedUnderTitle, deleteOpenSubtasks } = taskDeletionInputs;
const moveItBackFirst = 'If it was marked done by mistake, move it back with update_task_status first.';
const nameTheCompletedTask = `${keepFinishedUnderTitle}, naming the completed task for the work those subtasks finished`;
const sayTheOpenOnesGo = `${deleteOpenSubtasks} true, once the person has seen this list`;
const keepAnOpenOne = 'To keep one of them, move it out first with set_task_parent.';
const copyIsKept =
	'A copy of each deleted task is kept on the record of deletions, with its conversation and history. ' +
	'Its attached files are not kept.';

/** What delete_task answers: why nothing was deleted and what would be, or what was deleted and what was kept. */
export function describeTaskDeletion(outcome: TaskDeletionOutcome): string {
	const { plan, refusal } = outcome;
	if (refusal === taskDeletionRefusals.taskIsFinished) return `${finishedTaskStays(plan.task)} ${moveItBackFirst}`;
	if (refusal === taskDeletionRefusals.subtasksUndecided) return whatDeletingWouldDo(plan);
	return whatWasDeleted(plan, outcome.completedParent);
}

function whatDeletingWouldDo(plan: TaskDeletionPlan): string {
	const { task, finishedSubtasks, openSubtasks } = plan;
	const completedTaskName = finishedSubtasks.length === 0 ? [] : [nameTheCompletedTask];
	const wordOnOpenSubtasks = openSubtasks.length === 0 ? [] : [sayTheOpenOnesGo];
	const stillNeeded = [...completedTaskName, ...wordOnOpenSubtasks].join(', and ');
	return [
		`Nothing is deleted yet. "${task.title}" has subtasks, and deleting it would do this:`,
		...keptLines(finishedSubtasks),
		...deletedLines(openSubtasks),
		`To go ahead, call delete_task again with ${stillNeeded}.`
	].join('\n');
}

function keptLines(finishedSubtasks: FamilyTask[]): string[] {
	if (finishedSubtasks.length === 0) return [];
	const count = countOf(finishedSubtasks.length, 'finished subtask');
	const heading = `Keep ${count}, moved under a new completed task in its place:`;
	return [heading, ...finishedSubtasks.map(subtaskLine)];
}

function deletedLines(openSubtasks: FamilyTask[]): string[] {
	if (openSubtasks.length === 0) return [];
	const count = countOf(openSubtasks.length, 'open subtask');
	const heading = `Delete ${count}, conversation and history included:`;
	return [heading, ...openSubtasks.map(subtaskLine), keepAnOpenOne];
}

function whatWasDeleted(plan: TaskDeletionPlan, completedParent: CompletedParent | null): string {
	const { task, finishedSubtasks, openSubtasks } = plan;
	const deleted = whatWentLines(task, openSubtasks);
	const kept = whatStayedLines(finishedSubtasks, completedParent);
	return [...deleted, ...kept, copyIsKept].join('\n');
}

function whatWentLines(task: FamilyTask, openSubtasks: FamilyTask[]): string[] {
	if (openSubtasks.length === 0) return [`"${task.title}" deleted.`];
	const count = countOf(openSubtasks.length, 'open subtask');
	return [`"${task.title}" deleted, along with ${count}:`, ...openSubtasks.map(subtaskLine)];
}

function whatStayedLines(finishedSubtasks: FamilyTask[], completedParent: CompletedParent | null): string[] {
	if (completedParent === null) return [];
	const count = countOf(finishedSubtasks.length, 'finished subtask');
	const keptUnder = `"${completedParent.title}" (task id: ${completedParent.id})`;
	return [`Kept, under the new completed task ${keptUnder}: ${count}:`, ...finishedSubtasks.map(subtaskLine)];
}
