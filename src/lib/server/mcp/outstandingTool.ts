import { objectSchema } from './actionTypes';
import { outstandingToolName } from './outstandingToolName';
import { titleNameField } from './actions/waitingActions';
import { onlyWhatIAskedForField } from './actions/chaseScopeField';
import { runAction } from './runAction';
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
			'across every project they are on: the information they need to give, the things to set up, the features to test and their to-dos, each in a section of its own, and ' +
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
