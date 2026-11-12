import { showEverythingRequest } from '$lib/data/personRequests';
import { nextTurnText } from '$lib/server/agent/nextTurnText';
import { objectSchema } from '../actionTypes';
import { readTurnFocus, turnFocusFields } from './turnFocusFields';
import type { McpAction } from '../actionTypes';

export const nextTurnActions: McpAction[] = [
	{
		name: 'next_turn',
		area: 'conversations',
		audience: 'everyone',
		isWrite: false,
		summary:
			'the one thing to raise with the person now, bugs first, with why it matters and what a good answer looks like',
		guidance:
			'The YBT agent works one item per turn. Call it when the person asks what they need to do, what is ' +
			'on, or carries on a conversation about their work. Record their answer with answer_turn, which ' +
			'hands back the next turn. It is worked out fresh from the board, so the same board gives the same ' +
			'item however the chat started. Put that one item to the person in a sentence or two, never the ' +
			'whole list. projectId or bugsOnly narrow it when they ask to talk about one project or only bugs. ' +
			`whats_outstanding_for_me is for "${showEverythingRequest}".`,
		inputSchema: objectSchema(turnFocusFields),
		run: async (caller, input) => {
			const focus = readTurnFocus(caller, input);
			if (typeof focus === 'string') return focus;
			return nextTurnText(caller, focus, new Date());
		}
	}
];
