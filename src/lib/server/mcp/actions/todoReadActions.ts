import { getTodosOwnedBy, getUntakenTodos } from '$lib/server/todos/getTodos';
import { isTodoOpen } from '$lib/data/todo';
import { objectSchema, readOptionalText, textField } from '../actionTypes';
import { reachableProjectIds } from '../projectAccess';
import { describeTodos } from './describeTodos';
import type { McpAction } from '../actionTypes';

const showDone = 'yes';

export const todoReadActions: McpAction[] = [
	{
		name: 'list_my_todos',
		area: 'tasks',
		audience: 'everyone',
		isWrite: false,
		summary: 'your own to-do list, and the to-dos on your projects that nobody has taken yet',
		guidance:
			'The person’s own list: the jobs they have to do that do not hold development up, each ' +
			'with the task it serves. Tick one off with complete_todo when they say it is done; take ' +
			'an untaken one with update_todo.',
		inputSchema: objectSchema({ includeDone: textField('"yes" to list the finished ones too') }),
		run: async (caller, input) => {
			const isShowingDone = readOptionalText(input, 'includeDone') === showDone;
			const owned = await getTodosOwnedBy(caller.supabase, caller.accountId);
			const shown = isShowingDone ? owned : owned.filter((todo) => isTodoOpen(todo.status));
			const untaken = await getUntakenTodos(caller.supabase, reachableProjectIds(caller));
			return [
				'# Your to-dos',
				...describeTodos(shown),
				'',
				'# To-dos on your projects that nobody has taken',
				...describeTodos(untaken)
			].join('\n');
		}
	}
];
