import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { getLatestMessageOnTasks } from '$lib/server/conversations/getLatestMessageOnTasks';
import type { Account } from '$lib/server/accounts/accountRecord';
import type { ConversationMessage } from '$lib/server/conversations/messageRecord';
import type { GlobalTask } from '$lib/server/projects/getGlobalTaskPage';
import type { McpCaller } from '../resolveMcpCaller';
import type { WhatPersonOwes } from '$lib/server/owed/whatPersonOwes';

/** The open tasks a person owes: those assigned to them, and those whose title names them. */
export type OwedTasks = {
	assigned: GlobalTask[];
	named: GlobalTask[];
	name: string | null;
	latestByTask: Map<string, ConversationMessage>;
	accounts: Account[];
};

export async function getOwedTasks(caller: McpCaller, owes: WhatPersonOwes): Promise<OwedTasks> {
	const { assigned, named, person } = owes;
	const taskIds = [...assigned, ...named].map((task) => task.id);
	const latestByTask = await getLatestMessageOnTasks(caller.supabase, taskIds, caller.isStaff);
	const authorIds = [...latestByTask.values()].map((message) => message.authorAccountId);
	const accounts = await getAccountsById(caller.supabase, authorIds);
	return { assigned, named, name: person.titleName, latestByTask, accounts };
}
