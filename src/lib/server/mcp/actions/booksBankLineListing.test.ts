import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearLedgerTables, ledgerTables } from './booksLedgerDatabase.fixture';
import { heldBankLines, runOnTheBankLines as run } from './booksBankLineDatabase.fixture';
import { seventyEightLineStatement } from './booksBankStatement.fixture';

const standing = vi.hoisted(() => ({ switchedOn: [] as string[] }));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Your Business Today' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => standing.switchedOn }));

const bankId = '00000000-0000-4000-8000-000000001200';

describe('listing the statement lines', () => {
	beforeEach(async () => {
		standing.switchedOn = ['books'];
		clearLedgerTables();
		ledgerTables.books_ledger_accounts = [{ id: bankId, code: '1200', name: 'Bank', account_type: 'asset', is_system: true, is_archived: false }];
		await run('import_bank_lines', { applyRules: false, lines: seventyEightLineStatement().slice(0, 4) });
	});

	it('lists the lines in the statement order with their ids, narrowed by day and by matching', async () => {
		const every = await run('list_bank_lines', {});
		expect(every).toContain('4 shown, 4 unmatched.');
		expect(every).toContain('- 30 Jul 2026: BEADLE EM & GJ, JAMES LOAN, FASTER PAYMENT, £500.00, balance £500.00; unmatched. Id 00000000-0000-4000-8000-0000b1');
		heldBankLines()[0].matched_journal_id = 'journal-1';
		expect(await run('list_bank_lines', { matching: 'matched' })).toContain('1 shown, 0 unmatched.');
		expect(await run('list_bank_lines', { matching: 'unmatched', from: '2026-07-31' })).toContain('3 shown, 3 unmatched.');
		expect(await run('list_bank_lines', { matching: 'some' })).toBe('No reading was taken. matching is one of all, matched, unmatched; "some" was given.');
		expect(await run('list_bank_lines', { from: '2026-08-02', to: '2026-08-01' })).toContain('to is on or after from');
	});

	it('says what an empty listing means, as it was asked for', async () => {
		const held = "Your Business Today's books hold on 1200 Bank";
		expect(await run('list_bank_lines', { matching: 'matched' })).toBe(`No statement line ${held} is matched yet, 4 lines in all.`);
		for (const line of heldBankLines()) line.matched_journal_id = 'journal-1';
		expect(await run('list_bank_lines', { matching: 'unmatched' })).toBe(`Every statement line ${held} is matched, 4 lines in all.`);
		const firstDay = { matching: 'unmatched', from: '2026-07-30', to: '2026-07-30' };
		expect(await run('list_bank_lines', firstDay)).toBe(`Every statement line ${held} between 30 Jul 2026 and 30 Jul 2026 is matched, one line in all.`);
		const noLines = "Your Business Today's books hold no statement lines on 1200 Bank";
		expect(await run('list_bank_lines', { from: '2026-12-01' })).toBe(`${noLines} from 1 Dec 2026 on.`);
		expect(await run('list_bank_lines', { matching: 'unmatched', to: '2026-07-01' })).toBe(`${noLines} up to 1 Jul 2026.`);
		ledgerTables.books_bank_lines = [];
		expect(await run('list_bank_lines', { matching: 'matched' })).toBe(`${noLines} yet; import_bank_lines brings a statement in.`);
	});

	it('says so when the books have no Bank account yet', async () => {
		ledgerTables.books_ledger_accounts = [];
		expect(await run('list_bank_lines', {})).toBe("Your Business Today's books have no Bank account yet, so no statement lines.");
	});
});
