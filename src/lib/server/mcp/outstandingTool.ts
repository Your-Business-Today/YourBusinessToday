import { objectSchema } from './actionTypes';
import { outstandingToolName } from './outstandingToolName';
import { titleNameField } from './actions/waitingActions';
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
		title: 'What is outstanding for me',
		description:
			'Use this whenever the person asks what is outstanding for them, what they need to do, ' +
			'what is on today, what needs them, what they owe, what they are waiting on or who to ' +
			'chase — the morning check-in. One read-only answer across every project they are on: ' +
			'the information they need to give, the things to set up, the features to test and their ' +
			'to-dos, each in a section of its own (building is never theirs), and who to chase, ' +
			'person by person, for the answers and work they are waiting on. The answer opens with ' +
			'how to walk them through it.',
		inputSchema: objectSchema({ name: titleNameField }),
		annotations: { readOnlyHint: true },
		run: async (caller, argumentValues) => runAction(caller, summaryActionName, argumentValues)
	}
];
