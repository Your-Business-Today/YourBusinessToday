import { nextTurnText } from '$lib/server/agent/nextTurnText';
import type { McpCaller } from '../resolveMcpCaller';

/** Whether the person asked to see everything at once; otherwise the summary goes one item at a time. */
export const showEverythingField = {
	type: 'boolean',
	description:
		'True only when the person has asked in so many words to see everything at once, the whole list. ' +
		'Left out, the answer is the one item to raise now, as what_do_i_need_to_do gives it'
};

const everyFocus = { projectId: null, isBugsOnly: false };

const oneItemNote =
	'One item at a time: put this one item to the person in a sentence or two and never list the rest. ' +
	'Record their answer with answer_turn on their yes; it hands back the next item. Only if they ask to ' +
	'see everything at once, call this again with showEverything true.';

const showEverythingRefusal = 'showEverything is true or false, or left out. Nothing was read.';

/** Whether the whole list was asked for, or a refusal when showEverything is not a yes or no. */
export function validateShowEverything(input: Record<string, unknown>): boolean | string {
	const { showEverything } = input;
	if (showEverything === undefined) return false;
	if (typeof showEverything === 'boolean') return showEverything;
	return showEverythingRefusal;
}

/** The summary as the YBT agent gives it by default: the one item to raise now. */
export async function oneItemAtATime(caller: McpCaller): Promise<string> {
	return [oneItemNote, '', await nextTurnText(caller, everyFocus, new Date())].join('\n');
}
