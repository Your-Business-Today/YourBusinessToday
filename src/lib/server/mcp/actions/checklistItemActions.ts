import {} from '../projectAccess';
import { addChecklistItem } from '$lib/server/projects/addChecklistItem';
import { deleteChecklistItem } from '$lib/server/projects/deleteChecklistItem';
import {
	checklistIdField,
	findChecklistOnTask,
	findItemOnTask,
	itemIdField,
	taskIdField
} from './findChecklistOnTask';
import { objectSchema, readOptionalText, textField } from '../actionTypes';
import { setChecklistItemDone } from '$lib/server/projects/setChecklistItemDone';
import type { McpAction } from '../actionTypes';

const itemFields = {
	taskId: taskIdField,
	checklistId: checklistIdField,
	itemId: itemIdField
};
const itemFieldNames = ['taskId', 'checklistId', 'itemId'];

export const checklistItemActions: McpAction[] = [
	{
		name: 'add_checklist_item',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary: 'add one step to a checklist on a task',
		inputSchema: objectSchema(
			{
				taskId: taskIdField,
				checklistId: checklistIdField,
				description: textField('The step, in one line')
			},
			['taskId', 'checklistId', 'description']
		),
		run: async (caller, input) => {
			const found = await findChecklistOnTask(caller, input);
			if (typeof found === 'string') return found;
			const description = readOptionalText(input, 'description');
			if (description === null) return 'A checklist item needs a description.';
			const { checklist } = found;
			const itemId = await addChecklistItem(caller.supabase, checklist.id, description);
			return `Added to "${checklist.title}": ${description} (item id: ${itemId})`;
		}
	},
	{
		name: 'set_checklist_item_done',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary: 'tick or untick one step on a checklist',
		inputSchema: objectSchema(
			{
				...itemFields,
				isDone: { type: 'boolean', description: 'True when the step is done' }
			},
			[...itemFieldNames, 'isDone']
		),
		run: async (caller, input) => {
			const found = await findItemOnTask(caller, input);
			if (typeof found === 'string') return found;
			const isDone = input.isDone === true;
			const { item } = found;
			await setChecklistItemDone(caller.supabase, item.id, isDone);
			return `"${item.description}" is ${isDone ? 'done' : 'to do'}.`;
		}
	},
	{
		name: 'delete_checklist_item',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary: 'remove one step from a checklist',
		inputSchema: objectSchema(itemFields, itemFieldNames),
		run: async (caller, input) => {
			const found = await findItemOnTask(caller, input);
			if (typeof found === 'string') return found;
			const { item, checklist } = found;
			await deleteChecklistItem(caller.supabase, item.id);
			return `"${item.description}" removed from "${checklist.title}".`;
		}
	}
];
