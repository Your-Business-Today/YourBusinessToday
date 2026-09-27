import { describeInbox } from './describeInbox';
import { getAccountDirectory } from '$lib/server/accounts/getAccountDirectory';
import { longestMessageBody, postMessage } from '$lib/server/conversations/postMessage';
import { objectSchema, proseField, readOptionalText, textField } from '../actionTypes';
import { readInbox } from '$lib/server/conversations/readInbox';
import { reachableProjectIds } from '../projectAccess';
import { resolveSubject, noSuchSubject } from './resolveSubject';
import type { McpAction } from '../actionTypes';

export const conversationActions: McpAction[] = [
	{
		name: 'post_message',
		area: 'conversations',
		audience: 'everyone',
		isWrite: true,
		summary: 'say something on the conversation of a goal or a task',
		guidance:
			'Whatever you post is read by the person on the other side and by their Claude, so write ' +
			'to them: what you found, what you need, what happens next. Everyone on the project ' +
			'can read it; everyone in its conversation is told of it, and posting joins you. A ' +
			'question for one person names them; their Claude brings it to them through ' +
			'read_latest_messages and posts the answer here. When work on a task stops, the work log ' +
			'goes here too: what changed, which files or records, the decisions and why, what is left.',
		inputSchema: objectSchema(
			{
				goalId: textField('The goal to post on — give this or taskId'),
				taskId: textField('The task to post on — give this or goalId'),
				body: proseField('What you want to say')
			},
			['body']
		),
		run: async (caller, input) => {
			const body = readOptionalText(input, 'body');
			if (body === null) return 'Write the message first.';
			if (body.length > longestMessageBody)
				return `Keep it under ${longestMessageBody} characters.`;
			const subject = await resolveSubject(caller, input);
			if (subject === null) return noSuchSubject;
			await postMessage(caller.supabase, subject.subject, caller.accountId, body);
			return `Posted on "${subject.title}".`;
		}
	},
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
			'before moving on; a message may be the resolution of something they raised. A message ' +
			'that asks the person you are with a question is theirs to answer: put it to them, then ' +
			'post_message the answer on the same goal or task.',
		inputSchema: objectSchema({}),
		run: async (caller) => {
			const inbox = await readInbox(caller.supabase, {
				accountId: caller.accountId,
				projectIds: reachableProjectIds(caller),
				shouldIncludeInternal: false
			});
			const authorIds = inbox.messages.map((message) => message.authorAccountId);
			const accounts = await getAccountDirectory(caller.supabase, authorIds);
			return describeInbox(caller.supabase, inbox, accounts);
		}
	}
];
