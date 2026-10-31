import { postedViaChannels } from '$lib/data/conversationTurn';
import { batonSentence } from './batonSentence';
import { chooseHandOff, handOffFields } from './handOffFields';
import { longestMessageBody, postMessage } from '$lib/server/conversations/postMessage';
import { objectSchema, proseField, readOptionalText, textField } from '../actionTypes';
import { settleOpenQuestions } from '$lib/server/conversations/settleOpenQuestions';
import { applyProgress, progressField, progressRefusal, readProgress } from './progressField';
import { promiseField, promiseOnGoalRefusal, promiseRefusal, raisePromise, readPromise } from './promiseField';
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
	'Say with askKind what the ask wants: information, setup or testing. ' +
	'An ask is how anything a person must give reaches them — never a task raised for it. A job ' +
	'a person does for the project is a task in its department, assigned to them; building is ' +
	'never asked of a person. ' +
	'Anything else waits on nobody — the default. A question for the person you are with ' +
	'goes to them in chat, never into a message here: every other Claude on the project ' +
	'reads this conversation and would take it as theirs to answer. A decision needed from ' +
	'someone is a message waiting on them, never a line in ' +
	'the task details. A task held up by ' +
	'another waits for it (set_task_waits_for), never on hold with a note. Marking a task done ' +
	'is never asked of someone else: whoever finishes the work marks it done (update_task_status). ' +
	'When the person you are with promises something in the message ("I’ll do X"), give it ' +
	'as promise: it goes on their own to-do list, linked to this task, so it is never lost in prose. ' +
	'When the message reports work done on the task — by the person you are with or by anyone ' +
	'they tell you about — give progress, started or finished: the task moves ' +
	'to In progress or Done with the message. ' +
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
			progress: progressField,
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
		const unfitPromise = promiseRefusal(promise);
		if (unfitPromise !== null) return unfitPromise;
		const progress = readProgress(input);
		const isProgressOffTask = progress !== null && !('taskId' in resolved.subject);
		if (progress === undefined || isProgressOffTask) return progressRefusal;
		const choice = await chooseHandOff(caller, input, resolved);
		if ('refusal' in choice) return choice.refusal;
		const origin = {
			postedVia: postedViaChannels.claude,
			awaiting: choice.handOff,
			askKind: choice.askKind
		};
		await postMessage(caller.supabase, resolved.subject, caller.accountId, body, origin);
		if (choice.isSettlingThread) await settleOpenQuestions(caller.supabase, resolved.subject);
		const baton = await batonSentence(caller, resolved.subject);
		const promised = promise === null ? '' : await raisePromise(caller, resolved, promise);
		const moved = progress === null ? '' : await applyProgress(caller, resolved, progress);
		return `Posted on "${resolved.title}". ${baton}${promised}${moved}`;
	}
};
