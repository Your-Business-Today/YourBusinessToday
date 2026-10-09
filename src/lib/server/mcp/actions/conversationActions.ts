import { postedViaChannels } from '$lib/data/conversationTurn';
import { batonSentence } from './batonSentence';
import { chooseHandOff, handOffFields } from './handOffFields';
import { describeInbox } from './describeInbox';
import { getAccountDirectory } from '$lib/server/accounts/getAccountDirectory';
import { longestMessageBody, postMessage } from '$lib/server/conversations/postMessage';
import { markTurnsPickedUp } from '$lib/server/conversations/markTurnsPickedUp';
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
			'message waits on someone only when it asks them a question: name them with waitingOn, ' +
			'and say with waitingFor whether their Claude can answer on its own or it needs them. ' +
			'Their Claude picks it up through read_latest_messages and posts the answer here. ' +
			'Anything else waits on nobody — the default. Something a person has to do is a task ' +
			'assigned to them (set_task_assignees) or a subtask, not a wait; a task held up by ' +
			'another waits for it (set_task_waits_for), never on hold with a note. When work on a task stops, the work log goes here: ' +
			'what changed, the branch and pull request it is on, which files or records, the ' +
			'decisions and why, what is left.',
		inputSchema: objectSchema(
			{
				goalId: textField('The goal to post on — give this or taskId'),
				taskId: textField('The task to post on — give this or goalId'),
				body: proseField('What you want to say'),
				...handOffFields
			},
			['body']
		),
		run: async (caller, input) => {
			const body = readOptionalText(input, 'body');
			if (body === null) return 'Write the message first.';
			if (body.length > longestMessageBody)
				return `Keep it under ${longestMessageBody} characters.`;
			const resolved = await resolveSubject(caller, input);
			if (resolved === null) return noSuchSubject;
			const choice = await chooseHandOff(caller, input, resolved);
			if ('refusal' in choice) return choice.refusal;
			const origin = { postedVia: postedViaChannels.claude, awaiting: choice.handOff };
			await postMessage(caller.supabase, resolved.subject, caller.accountId, body, origin);
			return `Posted on "${resolved.title}". ${await batonSentence(caller, choice.handOff)}`;
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
			'post_message the answer on the same goal or task, waiting on nobody unless the answer ' +
			'asks something back. A message marked as waiting on you asks a question: reading it ' +
			'tells the other side you have picked it up, so answer it yourself when it waits on ' +
			'your Claude, and bring it to the person when it waits on them. What the person has to ' +
			'do is in read_team_tasks — the tasks assigned to them.',
		inputSchema: objectSchema({}),
		run: async (caller) => {
			await markTurnsPickedUp(caller.supabase, caller.accountId);
			const inbox = await readInbox(caller.supabase, {
				accountId: caller.accountId,
				projectIds: reachableProjectIds(caller),
				shouldIncludeInternal: false
			});
			const authorIds = inbox.messages.map((message) => message.authorAccountId);
			const accounts = await getAccountDirectory(caller.supabase, authorIds);
			return describeInbox(caller.supabase, inbox, accounts, caller.accountId);
		}
	}
];
