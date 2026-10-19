import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { getAssignedTasks } from '$lib/server/projects/getAssignedTasks';
import { getLatestMessageOnTasks } from '$lib/server/conversations/getLatestMessageOnTasks';
import { getTasksNamingPerson } from '$lib/server/projects/getTasksNamingPerson';
import { nameUsedInTitles } from '$lib/data/personNamedInTitle';
import { reachableProjectIds } from '../projectAccess';
import type { Account } from '$lib/server/accounts/accountRecord';
import type { ConversationMessage } from '$lib/server/conversations/messageRecord';
import type { GlobalTask } from '$lib/server/projects/getGlobalTaskPage';
import type { McpCaller } from '../resolveMcpCaller';

/** The open tasks a person owes: those assigned to them, and those whose title names them. */
export type OwedTasks = {
	assigned: GlobalTask[];
	named: GlobalTask[];
	name: string | null;
	latestByTask: Map<string, ConversationMessage>;
	accounts: Account[];
};

export async function getOwedTasks(caller: McpCaller, givenName: string | null): Promise<OwedTasks> {
	const name = givenName ?? (await callerTitleName(caller));
	const projectIds = reachableProjectIds(caller);
	const everyAssigned = await getAssignedTasks(caller.supabase, caller.accountId);
	const assigned = everyAssigned.filter((task) => projectIds.includes(task.projectId));
	const assignedIds = new Set(assigned.map((task) => task.id));
	const named = name === null ? [] : await getTasksNamingPerson(caller.supabase, projectIds, name);
	const namedOnly = named.filter((task) => !assignedIds.has(task.id));
	const taskIds = [...assigned, ...namedOnly].map((task) => task.id);
	const latestByTask = await getLatestMessageOnTasks(caller.supabase, taskIds, caller.isStaff);
	const authorIds = [...latestByTask.values()].map((message) => message.authorAccountId);
	const accounts = await getAccountsById(caller.supabase, authorIds);
	return { assigned, named: namedOnly, name, latestByTask, accounts };
}

async function callerTitleName(caller: McpCaller): Promise<string | null> {
	const [account] = await getAccountsById(caller.supabase, [caller.accountId]);
	if (account === undefined) return null;
	return nameUsedInTitles(account.name, account.email);
}
