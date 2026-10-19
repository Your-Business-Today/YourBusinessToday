import { describeInbox } from './describeInbox';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { markTurnsPickedUp } from '$lib/server/conversations/markTurnsPickedUp';
import { objectSchema } from '../actionTypes';
import { postMessageAction } from './postMessageAction';
import { readInbox } from '$lib/server/conversations/readInbox';
import { reachableProjectIds } from '../projectAccess';
import type { McpAction } from '../actionTypes';

export const conversationActions: McpAction[] = [
	postMessageAction,
	{
		name: 'read_latest_messages',
		area: 'conversations',
		audience: 'everyone',
		isWrite: true,
		summary:
			'everything said to you on your projects since you last looked, grouped by goal and task',
		guidance:
			'Call this at the start of a session and whenever the person asks what is new. Each call ' +
			'returns only what arrived since the last one and then moves the marker, so read it all ' +
			'before moving on; a message may be the resolution of something they raised. It opens ' +
			'with how many things wait on the person you are with and lists those first: reading ' +
			'them tells the other side you have picked them up, so answer each yourself when it ' +
			'waits on your Claude, and bring it to the person when it waits on them, then ' +
			'post_message the answer on the same goal or task, waiting on nobody unless the answer ' +
			'asks something back. Everything after that is for information only. Nothing there ' +
			'waits on them, whatever its words say — a question in it that is not marked as waiting ' +
			'on them is someone else’s to answer, so never count it or raise it as theirs. Everything ' +
			'the person owes — questions, tasks assigned to them and tasks titled with their name — is ' +
			'in list_waiting_on_me, in one answer.',
		inputSchema: objectSchema({}),
		run: async (caller) => {
			const inbox = await readInbox(caller.supabase, {
				accountId: caller.accountId,
				projectIds: reachableProjectIds(caller),
				shouldIncludeInternal: false
			});
			await markTurnsPickedUp(caller.supabase, caller.accountId, inbox.messages);
			const authorIds = inbox.messages.map((message) => message.authorAccountId);
			const accounts = await getAccountsById(caller.supabase, authorIds);
			return describeInbox(caller.supabase, inbox, accounts, caller.accountId);
		}
	}
];
