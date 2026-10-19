import { findAction } from './actionRegistry';
import { refuseUnknownFields } from './unknownFieldRefusal';
import type { McpCaller } from './resolveMcpCaller';
import type { McpToolAnswer } from './mcpContent';

export async function runAction(
	caller: McpCaller,
	name: string,
	input: Record<string, unknown>
): Promise<McpToolAnswer> {
	const action = findAction(name, caller);
	if (action === null) {
		return `There is no action called ${name} that you can run. Call list_actions to see what you can do.`;
	}
	refuseUnknownFields(action.name, action.inputSchema, input);
	return action.run(caller, input);
}
