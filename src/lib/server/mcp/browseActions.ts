import { actionsFor, findAction } from './actionRegistry';
import { readActionToolName, writeActionToolName } from './actionToolNames';
import type { ActionArea, McpAction } from './actionTypes';
import type { McpCaller } from './resolveMcpCaller';

export function listActions(caller: McpCaller, argumentValues: Record<string, unknown>): string {
	const area = (argumentValues.area ?? null) as ActionArea | null;
	const actions = actionsFor(caller, area);
	if (actions.length === 0) return 'Nothing is available to you in that area.';
	return actions.map(summariseAction).join('\n');
}

export function describeAction(caller: McpCaller, argumentValues: Record<string, unknown>): string {
	const action = findAction(String(argumentValues.name ?? ''), caller);
	if (action === null) return 'There is no action by that name that you can run.';
	return [
		`${action.name} — ${action.summary}`,
		`Area: ${action.area}. ${runsThrough(action)}`,
		action.guidance === undefined ? null : `\nHow we work: ${action.guidance}`,
		`\nInput schema:\n${JSON.stringify(action.inputSchema, null, 2)}`
	]
		.filter((line) => line !== null)
		.join('\n');
}

function summariseAction(action: McpAction): string {
	return `${action.name} [${action.area}${action.isWrite ? ', writes' : ''}] — ${action.summary}`;
}

function runsThrough(action: McpAction): string {
	if (action.isWrite) return `This one writes: run it with ${writeActionToolName}.`;
	return `This one only reads: run it with ${readActionToolName}.`;
}
