import { reachableTask } from '../projectAccess';
import { getTaskChecklists } from '$lib/server/projects/getTaskChecklists';
import { noSuchTask } from './describeTask';
import { readText, textField } from '../actionTypes';
import type { ChecklistItem, TaskChecklist } from '$lib/server/projects/checklistRecord';
import type { McpCaller } from '../resolveMcpCaller';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

export const taskIdField = textField('The task id');
export const checklistIdField = textField('The checklist id, as read_task gives it');
export const itemIdField = textField('The checklist item id, as read_task gives it');

const noSuchChecklist = 'That task has no checklist with that id. Call read_task to see them.';
const noSuchItem = 'That checklist has no item with that id. Call read_task to see them.';

export type ChecklistOnTask = { task: ProjectTask; checklist: TaskChecklist };
export type ItemOnTask = ChecklistOnTask & { item: ChecklistItem };

export async function findChecklistOnTask(
	caller: McpCaller,
	input: Record<string, unknown>
): Promise<ChecklistOnTask | string> {
	const task = await reachableTask(caller, readText(input, 'taskId'));
	if (task === null) return noSuchTask;
	const checklists = await getTaskChecklists(caller.supabase, task.id);
	const checklistId = readText(input, 'checklistId');
	const checklist = checklists.find((candidate) => candidate.id === checklistId);
	if (checklist === undefined) return noSuchChecklist;
	return { task, checklist };
}

export async function findItemOnTask(
	caller: McpCaller,
	input: Record<string, unknown>
): Promise<ItemOnTask | string> {
	const found = await findChecklistOnTask(caller, input);
	if (typeof found === 'string') return found;
	const itemId = readText(input, 'itemId');
	const { checklist } = found;
	const item = checklist.items.find((candidate) => candidate.id === itemId);
	if (item === undefined) return noSuchItem;
	return { ...found, item };
}
