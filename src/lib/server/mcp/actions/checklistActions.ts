import { reachableTask } from '../projectAccess';
import { createChecklist } from '$lib/server/projects/createChecklist';
import { deleteChecklist } from '$lib/server/projects/deleteChecklist';
import { findChecklistOnTask, checklistIdField, taskIdField } from './findChecklistOnTask';
import { noSuchTask } from './describeTask';
import { objectSchema, readOptionalText, readText, textField } from '../actionTypes';
import { renameChecklist } from '$lib/server/projects/renameChecklist';
import type { McpAction } from '../actionTypes';

const titleField = textField('What the checklist is called');

export const checklistActions: McpAction[] = [
	{
		name: 'add_checklist',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary: 'add a named checklist to a task, ready for items',
		guidance:
			'A checklist is the working steps of a task, ticked off as they happen. Acceptance ' +
			'criteria say when the task is done; a checklist says how it gets there.',
		inputSchema: objectSchema({ taskId: taskIdField, title: titleField }, ['taskId', 'title']),
		run: async (caller, input) => {
			const task = await reachableTask(caller, readText(input, 'taskId'));
			if (task === null) return noSuchTask;
			const title = readOptionalText(input, 'title');
			if (title === null) return 'A checklist needs a title.';
			const checklistId = await createChecklist(caller.supabase, task.id, title);
			return `Checklist "${title}" added to "${task.title}" (checklist id: ${checklistId}).`;
		}
	},
	{
		name: 'rename_checklist',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary: 'give a checklist on a task a new title',
		inputSchema: objectSchema(
			{ taskId: taskIdField, checklistId: checklistIdField, title: titleField },
			['taskId', 'checklistId', 'title']
		),
		run: async (caller, input) => {
			const found = await findChecklistOnTask(caller, input);
			if (typeof found === 'string') return found;
			const title = readOptionalText(input, 'title');
			if (title === null) return 'A checklist needs a title.';
			const { checklist } = found;
			await renameChecklist(caller.supabase, checklist.id, title);
			return `"${checklist.title}" is now called "${title}".`;
		}
	},
	{
		name: 'delete_checklist',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary: 'remove a checklist and all its items from a task',
		inputSchema: objectSchema({ taskId: taskIdField, checklistId: checklistIdField }, [
			'taskId',
			'checklistId'
		]),
		run: async (caller, input) => {
			const found = await findChecklistOnTask(caller, input);
			if (typeof found === 'string') return found;
			const { checklist, task } = found;
			await deleteChecklist(caller.supabase, checklist.id);
			return `Checklist "${checklist.title}" removed from "${task.title}".`;
		}
	}
];
