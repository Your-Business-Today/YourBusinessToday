import { readActionToolName, writeActionToolName } from './actionToolNames';
import { runReadAction, runWriteAction } from './runAction';
import type { McpTool } from './mcpTools';

const actionInputSchema = {
	type: 'object',
	properties: {
		name: { type: 'string', description: 'The action name' },
		input: { type: 'object', description: 'The action input, per describe_action' }
	},
	required: ['name'],
	additionalProperties: false
};

function actionInput(argumentValues: Record<string, unknown>): Record<string, unknown> {
	return (argumentValues.input ?? {}) as Record<string, unknown>;
}

/**
 * Two tools run actions, split by whether the action writes, so a host such as Claude Cowork lets
 * every read run unattended and still asks the person before every write.
 */
export const actionRunTools: McpTool[] = [
	{
		name: readActionToolName,
		title: 'Run one action that only reads',
		description:
			'Run an action that only reads, by name with its input: one list_actions shows without ' +
			`"writes". It changes nothing. An action that writes is refused here and runs through ${writeActionToolName}.`,
		inputSchema: actionInputSchema,
		annotations: { readOnlyHint: true },
		run: async (caller, argumentValues) =>
			runReadAction(caller, String(argumentValues.name ?? ''), actionInput(argumentValues))
	},
	{
		name: writeActionToolName,
		title: 'Run one action that writes',
		description:
			'Run an action that writes, by name with its input: one list_actions marks "writes". ' +
			'Writes are recorded under the signed-in person, exactly as if they had done it on the ' +
			`site. An action that only reads is refused here and runs through ${readActionToolName}.`,
		inputSchema: actionInputSchema,
		annotations: { readOnlyHint: false },
		run: async (caller, argumentValues) =>
			runWriteAction(caller, String(argumentValues.name ?? ''), actionInput(argumentValues))
	}
];
