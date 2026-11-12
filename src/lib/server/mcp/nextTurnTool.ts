import { showEverythingRequest } from '$lib/data/personRequests';
import { nextTurnToolName } from './nextTurnToolName';
import { objectSchema } from './actionTypes';
import { runAction } from './runAction';
import { turnFocusFields } from './actions/turnFocusFields';
import type { McpTool } from './mcpTools';

const nextTurnActionName = 'next_turn';

/**
 * The YBT agent's turn as a tool of its own, so the plain words a person uses reach the one item to
 * raise, rather than the whole list that whats_outstanding_for_me gives.
 */
export const nextTurnTools: McpTool[] = [
	{
		name: nextTurnToolName,
		title: 'What do I need to do?',
		description:
			'Use this whenever the person asks what they need to do, what is on, what needs them, what ' +
			'they owe or what is next on Your Business Today, or carries on talking their work through. ' +
			'It gives the ONE item to raise now, bugs first, with why it matters, the question and what a ' +
			'good answer is. Put that one item to them in a sentence or two and never list the rest. On ' +
			'their yes, record their answer with the answer_turn action (perform_action), which hands back ' +
			`the next item. projectId or bugsOnly narrow it. Only "${showEverythingRequest}" is whats_outstanding_for_me.`,
		inputSchema: objectSchema(turnFocusFields),
		annotations: { readOnlyHint: true },
		run: async (caller, argumentValues) => runAction(caller, nextTurnActionName, argumentValues)
	}
];
