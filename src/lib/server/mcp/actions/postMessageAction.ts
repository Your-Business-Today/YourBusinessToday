import { postedViaChannels } from '$lib/data/conversationTurn';
import { batonSentence } from './batonSentence';
import { chooseHandOff, handOffFields } from './handOffFields';
import { longestMessageBody, postMessage } from '$lib/server/conversations/postMessage';
import { objectSchema, proseField, readOptionalText, textField } from '../actionTypes';
import { promiseField, promiseOnGoalRefusal, raisePromise, readPromise } from './promiseField';
import { resolveSubject, noSuchSubject } from './resolveSubject';
import type { McpAction } from '../actionTypes';

const postMessageGuidance =
	'Whatever you post is read by the person on the other side and by their Claude, so write ' +
	'to them: what you found, what you need, what happens next. Everyone on the project ' +
	'can read it; everyone in its conversation is told of it, and posting joins you. A ' +
	'message waits on someone only when it asks them a question: name them with waitingOn, ' +
	'and say with waitingFor whether their Claude can answer on its own or it needs them. ' +
	'Their Claude picks it up through read_latest_messages and posts the answer here. ' +
	'Anything asked of a person is posted here as a message waiting on them, never only on ' +
	'WhatsApp, email or a call: an ask that is not on the task is one their Claude cannot see. ' +
	'Anything else waits on nobody — the default. A question for the person you are with ' +
	'goes to them in chat, never into a message here: every other Claude on the project ' +
	'reads this conversation and would take it as theirs to answer. A decision needed from ' +
	'someone is a message waiting on them, or a subtask assigned to them, never a line in ' +
	'the task details. Something a person has to do is a task ' +
	'assigned to them (set_task_assignees) or a subtask, not a wait; a task held up by ' +
	'another waits for it (set_task_waits_for), never on hold with a note. Marking a task done ' +
	'is never asked of someone else: whoever finishes the work marks it done (update_task_status). ' +
	'When the person you are with promises something in the message ("I’ll do X"), give it ' +
	'as promise: it becomes a subtask assigned to them, so it is never lost in prose. ' +
	'When work on a task stops, the work log goes here: ' +
	'what changed, the branch and pull request it is on, which files or records, the ' +
	'decisions and why, and which tasks carry what is left — then the person is told in ' +
	'chat that the chat can be archived.';

export const postMessageAction: McpAction = {
	name: 'post_message',
	area: 'conversations',
	audience: 'everyone',
	isWrite: true,
	summary: 'say something on the conversation of a goal or a task',
	guidance: postMessageGuidance,
	inputSchema: objectSchema(
		{
			goalId: textField('The goal to post on — give this or taskId'),
			taskId: textField('The task to post on — give this or goalId'),
			body: proseField('What you want to say'),
			promise: promiseField,
			...handOffFields
		},
		['body']
	),
	run: async (caller, input) => {
		const body = readOptionalText(input, 'body');
		if (body === null) return 'Write the message first.';
		if (body.length > longestMessageBody) return `Keep it under ${longestMessageBody} characters.`;
		const resolved = await resolveSubject(caller, input);
		if (resolved === null) return noSuchSubject;
		const promise = readPromise(input);
		if (promise !== null && !('taskId' in resolved.subject)) return promiseOnGoalRefusal;
		const choice = await chooseHandOff(caller, input, resolved);
		if ('refusal' in choice) return choice.refusal;
		const origin = { postedVia: postedViaChannels.claude, awaiting: choice.handOff };
		await postMessage(caller.supabase, resolved.subject, caller.accountId, body, origin);
		const baton = await batonSentence(caller, choice.handOff);
		const promised = promise === null ? '' : await raisePromise(caller, resolved, promise);
		return `Posted on "${resolved.title}". ${baton}${promised}`;
	}
};
