import { describeChaseList } from './describeChaseList';
import { describeSummary } from './describeSummary';
import { getChaseList } from './chaseList';
import { getOwedTasks } from './owedTasks';
import { getWaitingQuestionsFor } from './waitingQuestionsFor';
import { objectSchema, readOptionalText } from '../actionTypes';
import { getTodosOwnedBy } from '$lib/server/todos/getTodos';
import { isTodoOpen } from '$lib/data/todo';
import { summaryWalkthrough } from './summaryWalkthrough';
import { titleNameField } from './waitingActions';
import type { McpAction } from '../actionTypes';

const summaryHeading =
	'# What needs you\nYour YBT summary: the information, setup and testing waiting on you, and your to-dos.';

export const summaryActions: McpAction[] = [
	{
		name: 'read_ybt_summary',
		area: 'conversations',
		audience: 'everyone',
		isWrite: false,
		summary:
			'the YBT summary — the information, setup and testing waiting on you and your to-dos, ' +
			'across every project, then who to chase, and how to walk the person through them',
		guidance:
			'Use it whenever the person asks for their YBT summary, what is outstanding for them, what ' +
			'they have on, what needs them or who to chase across their projects. Its answer opens with ' +
			'how to give the summary: information one question at a time, setup as a checklist, testing ' +
			'as one bulk pass, then their to-dos, then who to chase. Building is never listed: it is ' +
			'Claude’s. It holds what list_waiting_on_me holds, by kind.',
		inputSchema: objectSchema({ name: titleNameField }),
		run: async (caller, input) => {
			const [waiting, owed, chaseList, everyTodo] = await Promise.all([
				getWaitingQuestionsFor(caller),
				getOwedTasks(caller, readOptionalText(input, 'name')),
				getChaseList(caller),
				getTodosOwnedBy(caller.supabase, caller.accountId)
			]);
			const todos = everyTodo.filter((todo) => isTodoOpen(todo.status));
			const summary = describeSummary({ waiting, todos, owed, viewerId: caller.accountId });
			const chase = describeChaseList(chaseList, caller.accountId);
			return [summaryWalkthrough, '', summaryHeading, '', ...summary, '', ...chase].join('\n');
		}
	}
];
