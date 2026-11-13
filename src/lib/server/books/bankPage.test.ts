import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearLedgerTables } from '$lib/server/mcp/actions/booksLedgerDatabase.fixture';
import { bankLineSupabase, organisationId, runOnTheBankLines as run } from '$lib/server/mcp/actions/booksBankLineDatabase.fixture';
import { holdReconciledBooks, statementLines } from '$lib/server/mcp/actions/booksBankReconciliationWorld.fixture';
import { readBankPage } from './bankPage';
import type { SupabaseClient } from '@supabase/supabase-js';

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Your Business Today' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['books'] }));

const coffee = { date: '2026-11-09', counterparty: 'COSTA COFFEE', reference: '', kind: 'CONTACTLESS', amount: -3.45, balanceAfter: 970.15 };

const readPage = () => readBankPage(bankLineSupabase as unknown as SupabaseClient, organisationId);

describe('the Bank page', () => {
	beforeEach(holdReconciledBooks);

	it("lists every statement line in the statement's order with what each is matched to, reconciled to the last day", async () => {
		const page = await readPage();
		expect(page.standing).toBe('Reconciled to 9 Nov 2026.');
		expect(page.lines.map((line) => [line.counterparty, line.moneyIn, line.moneyOut, line.balance, line.isMatched])).toEqual([
			['BEADLE EM & GJ', 1000, null, 1000, true],
			['ANTHROPIC', null, 18, 982, true],
			['GITHUB', null, 8.4, 973.6, true]
		]);
		expect(page.lines.every((line) => line.matchedTo !== '')).toBe(true);
	});

	it('says how many lines are left to match, with both balances, when a line is never matched', async () => {
		await run('import_bank_lines', { applyRules: false, lines: [...statementLines, coffee] });
		const page = await readPage();
		expect(page.standing).toBe('1 line to match. The statement says £970.15 and the books £973.60.');
		expect(page.lines.at(-1)).toMatchObject({ counterparty: 'COSTA COFFEE', moneyOut: 3.45, isMatched: false, matchedTo: '' });
	});

	it('says no statement has been brought in when the books have no Bank account', async () => {
		clearLedgerTables();
		expect(await readPage()).toEqual({ lines: [], standing: expect.stringMatching(/^No bank statement has been brought in yet\./) });
	});
});
