import { describe, expect, it } from 'vitest';
import { seedDemoBusiness } from '$lib/data/demo/seed/seedDemoBusiness';
import { McpErrorCode } from '$lib/server/mcp/mcpErrors';
import { answerDemoRequest, type DemoCopy } from './answerDemoRequest';
import type { DemoBusiness } from '$lib/data/demo/demoBusiness';

type Result = Record<string, any>;
type Answered = { result?: Result; error?: { code: number; message: string } };

const today = '2026-10-20';

function copyThatRemembersSaves(): { copy: DemoCopy; saved: DemoBusiness[] } {
	const saved: DemoBusiness[] = [];
	const copy: DemoCopy = {
		business: seedDemoBusiness(today),
		today,
		save: async (changed) => {
			saved.push(changed);
		}
	};
	return { copy, saved };
}

async function resultOf(copy: DemoCopy, method: string, params: Record<string, unknown> = {}): Promise<Result> {
	const answered: Answered = await answerDemoRequest(copy, { id: 1, method, params });
	return answered.result ?? {};
}

function firstTextOf(result: Result): string {
	const [firstBlock] = result.content;
	return firstBlock.text;
}

describe('the demo connector', () => {
	it('initialises without any sign-in and names itself as the demo', async () => {
		const { copy } = copyThatRemembersSaves();
		const { serverInfo, protocolVersion } = await resultOf(copy, 'initialize', { protocolVersion: '2025-06-18' });
		expect(serverInfo.name).toBe('your-business-today-demo');
		expect(protocolVersion).toBe('2025-06-18');
	});

	it('lists the reading and the acting tools', async () => {
		const { copy } = copyThatRemembersSaves();
		const { tools } = await resultOf(copy, 'tools/list');
		const names = tools.map((tool: { name: string }) => tool.name);
		expect(names).toContain('find_money_and_opportunity');
		expect(names).toContain('raise_invoice');
		expect(names).toContain('remember');
		expect(names).toContain('reset_demo');
	});

	it('answers a reading tool without saving', async () => {
		const { copy, saved } = copyThatRemembersSaves();
		const result = await resultOf(copy, 'tools/call', { name: 'find_money_and_opportunity' });
		expect(firstTextOf(result)).toContain('£79,052');
		expect(saved).toHaveLength(0);
	});

	it('saves the copy after an acting tool', async () => {
		const { copy, saved } = copyThatRemembersSaves();
		const note = 'Chase the hotel by phone, never by email.';
		const result = await resultOf(copy, 'tools/call', { name: 'remember', arguments: { note } });
		expect(result.isError).toBe(false);
		const [{ brain }] = saved;
		expect(brain.at(-1)?.note).toBe(note);
	});

	it('refuses a field a tool does not take, naming the ones it does', async () => {
		const { copy, saved } = copyThatRemembersSaves();
		const wrongField = { invoice: 'INV-1041' };
		const result = await resultOf(copy, 'tools/call', { name: 'chase_invoice', arguments: wrongField });
		expect(result.isError).toBe(true);
		expect(firstTextOf(result)).toContain('invoiceId');
		expect(saved).toHaveLength(0);
	});

	it('refuses a method it does not serve', async () => {
		const { copy } = copyThatRemembersSaves();
		const { error }: Answered = await answerDemoRequest(copy, { id: 1, method: 'resources/list', params: {} });
		expect(error?.code).toBe(McpErrorCode.MethodNotFound);
	});
});
