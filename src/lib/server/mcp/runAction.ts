import { findAction } from './actionRegistry';
import { readActionToolName, writeActionToolName } from './actionToolNames';
import { refuseUnknownFields } from './unknownFieldRefusal';
import type { McpAction } from './actionTypes';
import type { McpCaller } from './resolveMcpCaller';
import type { McpToolAnswer } from './mcpContent';

type ActionGate = (action: McpAction) => string | null;

const anyAction: ActionGate = () => null;

const onlyReads: ActionGate = (action) => {
	if (!action.isWrite) return null;
	return `${action.name} writes, so it runs through ${writeActionToolName}, which asks the person first. Nothing was done.`;
};

const onlyWrites: ActionGate = (action) => {
	if (action.isWrite) return null;
	return `${action.name} only reads, so it runs through ${readActionToolName}, which needs no approval. Nothing was done.`;
};

export async function runAction(
	caller: McpCaller,
	name: string,
	input: Record<string, unknown>
): Promise<McpToolAnswer> {
	return runGatedAction(caller, name, input, anyAction);
}

export async function runReadAction(
	caller: McpCaller,
	name: string,
	input: Record<string, unknown>
): Promise<McpToolAnswer> {
	return runGatedAction(caller, name, input, onlyReads);
}

export async function runWriteAction(
	caller: McpCaller,
	name: string,
	input: Record<string, unknown>
): Promise<McpToolAnswer> {
	return runGatedAction(caller, name, input, onlyWrites);
}

async function runGatedAction(
	caller: McpCaller,
	name: string,
	input: Record<string, unknown>,
	gate: ActionGate
): Promise<McpToolAnswer> {
	const action = findAction(name, caller);
	if (action === null) {
		return `There is no action called ${name} that you can run. Call list_actions to see what you can do.`;
	}
	const refusal = gate(action);
	if (refusal !== null) return refusal;
	refuseUnknownFields(action.name, action.inputSchema, input);
	return action.run(caller, input);
}
