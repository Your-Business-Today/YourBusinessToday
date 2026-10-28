import { describe, expect, it, vi } from 'vitest';
import { objectSchema } from './actionTypes';
import { readActionToolName, writeActionToolName } from './actionToolNames';
import { describeMcpTools, findMcpTool } from './mcpTools';
import type { McpAction } from './actionTypes';
import type { McpCaller } from './resolveMcpCaller';

vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'https://files.example/',
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-publishable-key'
}));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$env/dynamic/public', () => ({ env: {} }));

const readsAnswer = 'the task, read';
const writesAnswer = 'the task, renamed';

const readTask = { name: 'read_task', isWrite: false, inputSchema: objectSchema({}) };
const renameTask = { name: 'rename_task', isWrite: true, inputSchema: objectSchema({}) };
const actionsByName: Record<string, Partial<McpAction>> = {
	read_task: { ...readTask, run: async () => readsAnswer },
	rename_task: { ...renameTask, run: async () => writesAnswer }
};

vi.mock('./actionRegistry', () => ({
	findAction: (name: string) => actionsByName[name] ?? null
}));

const caller = { accountId: 'account-1', supabase: {} } as unknown as McpCaller;
const readOnlyToolNames = ['get_current_context', 'list_actions', 'describe_action', readActionToolName];

async function runThrough(toolName: string, actionName: string) {
	const tool = findMcpTool(toolName);
	return tool?.run(caller, { name: actionName, input: {} });
}

function annotationsOf(toolName: string) {
	const tool = describeMcpTools().find((described) => described.name === toolName);
	return tool?.annotations;
}

describe('the tools that run actions', () => {
	it('marks every tool that only reads as read-only, so a host runs it without asking', () => {
		for (const toolName of readOnlyToolNames) {
			expect(annotationsOf(toolName), toolName).toEqual({ readOnlyHint: true });
		}
	});

	it('leaves the tool that writes gated', () => {
		expect(annotationsOf(writeActionToolName)).toEqual({ readOnlyHint: false });
	});

	it('runs an action that only reads through the read-only tool', async () => {
		expect(await runThrough(readActionToolName, 'read_task')).toBe(readsAnswer);
	});

	it('refuses a write through the read-only tool, naming the tool that asks first', async () => {
		const answer = await runThrough(readActionToolName, 'rename_task');
		expect(answer).toContain(`rename_task writes, so it runs through ${writeActionToolName}`);
	});

	it('runs an action that writes through the write tool', async () => {
		expect(await runThrough(writeActionToolName, 'rename_task')).toBe(writesAnswer);
	});

	it('sends a read on the write tool to the read-only one, so it is never gated', async () => {
		const answer = await runThrough(writeActionToolName, 'read_task');
		expect(answer).toContain(`read_task only reads, so it runs through ${readActionToolName}`);
	});
});
