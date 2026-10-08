import { describe, expect, it, vi } from 'vitest';
import { answerMcpRequest } from './mcpMethods';
import { McpErrorCode } from './mcpErrors';
import type { McpCaller } from './resolveMcpCaller';

vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'https://files.example/',
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-publishable-key'
}));
vi.mock('$env/dynamic/private', () => ({ env: {} }));

type Described = Record<string, any>;
type Answered = { result?: Described; error?: { code: number } };

const caller = { accountId: 'account-1', supabase: {} } as unknown as McpCaller;
const namesEveryObjectInherits = ['constructor', 'toString', 'hasOwnProperty', '__proto__'];

async function ask(method: string, params: Record<string, unknown> = {}) {
	const answered: Answered = await answerMcpRequest(caller, { id: 1, method, params });
	const { result = {}, error } = answered;
	return { result, isAnswered: answered.result !== undefined, refusalCode: error?.code };
}

describe('the connector’s methods', () => {
	it('answers only the methods it declares, never a name every object inherits', async () => {
		for (const name of namesEveryObjectInherits) {
			const { isAnswered, refusalCode } = await ask(name);
			expect(isAnswered, name).toBe(false);
			expect(refusalCode, name).toBe(McpErrorCode.MethodNotFound);
		}
	});

	it('still answers the methods it has', async () => {
		const { result } = await ask('initialize', { protocolVersion: '2025-11-25' });
		expect(result.protocolVersion).toBe('2025-11-25');
	});
});
