import { attachmentLines } from './describeAttachments';
import { branchLine } from './describeBranch';
import { accountNameLookup } from '$lib/data/accountNames';
import { goalHorizonLabels } from '$lib/data/goalHorizon';
import { supportTaskKind, taskKindLabels, taskStatusLabelFor } from '$lib/data/taskKind';
import { threadLines } from './describeMessages';
import type { AcceptanceCriterion } from '$lib/server/projects/criterionRecord';
import type { loadTaskWorkspace } from '$lib/server/projects/loadTaskWorkspace';
import type { ProjectTask } from '$lib/server/projects/taskRecord';
import type { ChecklistItem, TaskChecklist } from '$lib/server/projects/checklistRecord';

export type TaskWorkspace = NonNullable<Awaited<ReturnType<typeof loadTaskWorkspace>>>;

export const noSuchTask = 'No task has that id. Call read_task_queue or read_project to find it.';

export function describeTask(workspace: TaskWorkspace): string {
	const task = workspace.task;
	return [
		headline(task),
		`Project: ${workspace.project.name} (id: ${workspace.project.id})`,
		priorityLine(task),
		`Goal: ${goalTitle(workspace)}. Due: ${task.dueDate ?? 'no date set'}.`,
		raisedByLine(workspace),
		teamLine(workspace),
		storyLine(task),
		branchLine(task),
		task.details === '' ? 'No details written yet.' : `Details: ${task.details}`,
		...criterionLines(workspace.criteria),
		...checklistLines(workspace.checklists),
		...attachmentLines(workspace.attachments, workspace.people),
		...threadLines(workspace.messages, workspace.accounts)
	]
		.filter((line) => line !== null)
		.join('\n');
}

function headline(task: ProjectTask): string {
	const status = taskStatusLabelFor(task.kind, task.status);
	const progress = `${task.storyPoints} points, ${task.completionPercent}% done`;
	return `${task.title} — ${taskKindLabels[task.kind]} task, ${status}, ${progress} (id: ${task.id})`;
}

function priorityLine(task: ProjectTask): string {
	if (task.parentTaskId !== null) return `Priority ${task.priority} among the subtasks of its parent.`;
	const queuePosition = task.globalPriority === null ? '' : `; position ${task.globalPriority} in the owner\u2019s queue`;
	return `Priority ${task.priority} among the project\u2019s top level tasks${queuePosition}.`;
}

function goalTitle(workspace: TaskWorkspace): string {
	const goal = workspace.goals.find((candidate) => candidate.id === workspace.task.goalId);
	if (goal === undefined) return 'none';
	return `${goal.title} (${goalHorizonLabels[goal.horizon].toLowerCase()} goal, id: ${goal.id})`;
}

function raisedByLine(workspace: TaskWorkspace): string | null {
	const task = workspace.task;
	if (task.kind !== supportTaskKind) return null;
	const raiser = accountNameLookup(workspace.accounts)(task.createdBy);
	if (task.resolution === '') return `Raised by ${raiser}; awaiting our answer.`;
	return `Raised by ${raiser}. Resolution: ${task.resolution}`;
}

function teamLine(workspace: TaskWorkspace): string {
	const names = workspace.people
		.filter((person) => workspace.assigneeIds.includes(person.id))
		.map((person) => person.name);
	const assignees = names.length === 0 ? 'nobody' : names.join(', ');
	const roles = workspace.roles.length === 0 ? 'none named' : workspace.roles.join(', ');
	return `Assigned to ${assignees}. Roles: ${roles}.`;
}

function storyLine(task: ProjectTask): string {
	if (!task.isUserStory) return 'This is not written as a user story yet.';
	return `Story: as ${task.storyRole}, I want ${task.storyWant}, so that ${task.storyBenefit}.`;
}

function criterionLines(criteria: AcceptanceCriterion[]): string[] {
	if (criteria.length === 0) return ['Acceptance criteria: none yet.'];
	return ['Acceptance criteria:', ...criteria.map(criterionLine)];
}

function criterionLine(criterion: AcceptanceCriterion): string {
	const state = criterion.isMet ? 'met' : 'not met';
	return `- ${criterion.description} (${state}, id: ${criterion.id})`;
}

function checklistLines(checklists: TaskChecklist[]): string[] {
	return checklists.flatMap((checklist) => [
		`Checklist "${checklist.title}" (id: ${checklist.id}):`,
		...checklist.items.map(checklistItemLine)
	]);
}

function checklistItemLine(item: ChecklistItem): string {
	return `- ${item.description} (${itemState(item.isDone)}, id: ${item.id})`;
}

function itemState(isDone: boolean): string {
	if (isDone) return 'done';
	return 'to do';
}
