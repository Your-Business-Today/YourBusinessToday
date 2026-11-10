import { describe, expect, it, vi } from 'vitest';
import { findAction } from '../actionRegistry';
import { findMcpTool, type McpTool } from '../mcpTools';
import { readsOfAProject, readsOfTheAccount, selfCheckCalls } from './selfCheckCalls';
import type { AccountStanding } from '../resolveAccountStanding';

vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'https://files.example/',
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-publishable-key'
}));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$env/dynamic/public', () => ({ env: {} }));

const anAdministrator = { isAdmin: true, isStaff: true } as AccountStanding;
const aProjectId = '121925ec-bf29-46a2-bd62-374f3ca05648';

function isMarkedAsReading(tool: McpTool | null): boolean {
	const annotations = tool?.annotations ?? {};
	return annotations.readOnlyHint === true;
}

function isOfferedAndReads(name: string): boolean {
	const action = findAction(name, anAdministrator);
	return action !== null && !action.isWrite;
}

function callNamesFor(projectId: string | null): string[] {
	return selfCheckCalls(projectId).map((call) => call.name);
}

describe('the calls the self-check makes', () => {
	it('calls only tools the connector serves and marks as reading', () => {
		const tools = selfCheckCalls(aProjectId).map((call) => findMcpTool(call.tool));
		expect(tools.every(isMarkedAsReading)).toBe(true);
	});

	it('runs only actions an administrator is offered that do not write', () => {
		expect([...readsOfTheAccount, ...readsOfAProject].every(isOfferedAndReads)).toBe(true);
	});

	it('reads a project only when it has one to read', () => {
		expect(callNamesFor(null)).not.toContain('run_read_action read_project');
		expect(callNamesFor(aProjectId)).toContain('run_read_action read_project');
	});
});
