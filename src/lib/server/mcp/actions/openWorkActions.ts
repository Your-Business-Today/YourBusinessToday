import { describeOpenWork } from './describeOpenWork';
import { findPersonAsked, type PersonAsked } from '$lib/server/owed/personAsked';
import { getWhatPersonOwes } from '$lib/server/owed/whatPersonOwes';
import { reachableProjectIds } from '../projectAccess';
import { objectSchema, readOptionalText, textField } from '../actionTypes';
import type { Account } from '$lib/server/accounts/accountRecord';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

export const openWorkActionName = 'read_open_work';

export const personAskedField = textField(
	'Who the question is about: a first name, a full name, an email or an account id of anyone on ' +
		'your projects — leave out for yourself'
);

export const openWorkActions: McpAction[] = [
	{
		name: openWorkActionName,
		area: 'tasks',
		audience: 'everyone',
		isWrite: false,
		summary:
			'how many tasks, asks and to-dos a person has open, and which: a real count across every project you can see',
		guidance:
			'Use it for every "how many…", "what does X have", "what is on X’s plate" or "has X got anything" ' +
			'question, about yourself or anyone on your projects. It counts every open task assigned to them ' +
			'or named in a title, of every department and status, every ask waiting on them and their ' +
			'to-dos, and lists each one. Nothing is ranked away: the one-item turn and the team’s internal ' +
			'jobs list are never a count.',
		inputSchema: objectSchema({ person: personAskedField }),
		run: async (caller, input) => readOpenWork(caller, readOptionalText(input, 'person'))
	}
];

async function readOpenWork(caller: McpCaller, words: string | null): Promise<string> {
	const projectIds = reachableProjectIds(caller);
	const lookup = await findPersonAsked({ supabase: caller.supabase, callerId: caller.accountId, projectIds, words });
	const { found, candidates } = lookup;
	if (found === null) return whichPerson(words ?? '', candidates);
	const { person, isCaller } = found;
	const owes = await getWhatPersonOwes(caller.supabase, person, projectIds);
	const everyTodo = owes.todos;
	const todos = isCaller ? everyTodo : everyTodo.filter((todo) => isPromisedOn(todo, projectIds));
	return describeOpenWork({ ...owes, todos, name: nameOf(found), isCaller, projectCount: projectIds.length });
}

function isPromisedOn(todo: { taskId: string | null; projectId: string | null }, projectIds: string[]): boolean {
	if (todo.taskId === null) return false;
	return projectIds.includes(todo.projectId ?? '');
}

function nameOf(found: PersonAsked): string {
	const { account, person } = found;
	if (account.name !== account.email) return account.name;
	return person.titleName ?? account.name;
}

function whichPerson(words: string, candidates: Account[]): string {
	const choices = candidates.map((account) => `${account.name} (${account.email}, id: ${account.id})`).join('; ');
	return `"${words}" is not one person on your projects. Ask again with one of: ${choices}. Nothing was counted.`;
}
