import { objectSchema } from './actionTypes';
import { outstandingToolName } from './outstandingToolName';
import { titleNameField } from './actions/waitingActions';
import { onlyWhatIAskedForField } from './actions/chaseScopeField';
import { runAction } from './runAction';
import { openWorkActionName, personAskedField } from './actions/openWorkActions';
import { openWorkToolName } from './openWorkToolName';
import { showEverythingField } from './actions/showEverythingField';
import type { McpTool } from './mcpTools';

const summaryActionName = 'read_ybt_summary';

/**
 * The morning question as a tool of its own, so a Claude reaches it from the plain words a person
 * uses rather than having to know that read_ybt_summary sits behind run_read_action.
 */
export const outstandingTools: McpTool[] = [
	{
		name: outstandingToolName,
		title: 'Show me everything outstanding',
		description:
			'For what they need to do, what is on or what is next, use what_do_i_need_to_do. Left as it is, ' +
			'this also gives just the one item to raise now. Only when the person asks in so many words to ' +
			'see everything at once, give showEverything true for the whole list: one read-only answer ' +
			'across every project they are on: the information they need to give, the things to set up and their to-dos, each in a section of its own, and ' +
			'who to chase, person by person (onlyWhatIAskedFor narrows it to what they asked for). Bugs ' +
			'come first. The answer opens with how to walk them through it.',
		inputSchema: objectSchema({
			name: titleNameField,
			onlyWhatIAskedFor: onlyWhatIAskedForField,
			showEverything: showEverythingField
		}),
		annotations: { readOnlyHint: true },
		run: async (caller, argumentValues) => runAction(caller, summaryActionName, argumentValues)
	}
];

/**
 * The count of what someone has open as a tool of its own, so "how many tasks does James have"
 * reaches a real count from the plain words, rather than the one item the turn gives.
 */
export const openWorkTools: McpTool[] = [
	{
		name: openWorkToolName,
		title: 'How much does someone have open?',
		description:
			'Use this whenever anyone asks how many tasks, asks or to-dos a person has, what is on their ' +
			'plate, or whether they have anything open — about themselves or anyone on their projects. It is ' +
			'the real count across every project the asker can see, every department and status, with each ' +
			'item listed: nothing is ranked away. Never answer such a question from what_do_i_need_to_do, ' +
			'which gives one item, or from the team’s internal jobs list, and never say "none" without it.',
		inputSchema: objectSchema({ person: personAskedField }),
		annotations: { readOnlyHint: true },
		run: async (caller, argumentValues) => runAction(caller, openWorkActionName, argumentValues)
	}
];
