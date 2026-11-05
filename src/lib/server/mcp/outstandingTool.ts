import { objectSchema } from './actionTypes';
import { outstandingToolName } from './outstandingToolName';
import { titleNameField } from './actions/waitingActions';
import { onlyWhatIAskedForField } from './actions/chaseScopeField';
import { runAction } from './runAction';
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
			'Use this only when the person asks to see everything at once: the whole list, their full YBT ' +
			'summary, everything outstanding across every project, or who to chase. For what they need to ' +
			'do, what is on or what is next, use what_do_i_need_to_do, which goes one item at a time. One ' +
			'read-only answer across every project they are on: the information they need to give, the ' +
			'things to set up, the features to test and their to-dos, each in a section of its own, and ' +
			'who to chase, person by person (onlyWhatIAskedFor narrows it to what they asked for). Bugs ' +
			'come first. The answer opens with how to walk them through it.',
		inputSchema: objectSchema({ name: titleNameField, onlyWhatIAskedFor: onlyWhatIAskedForField }),
		annotations: { readOnlyHint: true },
		run: async (caller, argumentValues) => runAction(caller, summaryActionName, argumentValues)
	}
];
