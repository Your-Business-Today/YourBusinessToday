import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearLedgerTables, ledgerTables } from './booksLedgerDatabase.fixture';
import { heldBankLines, runOnTheBankLines as run } from './booksBankLineDatabase.fixture';

const standing = vi.hoisted(() => ({ switchedOn: [] as string[] }));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Your Business Today' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => standing.switchedOn }));

const bankId = '00000000-0000-4000-8000-000000001200';
const annys = { date: '2026-10-24', counterparty: 'ANNYS', reference: 'ANNYS     ', kind: 'CARD PAYMENT', amount: -24.99 };
const trimmed = { ...annys, reference: 'ANNYS' };
const coffee = { date: '2026-11-05', counterparty: 'COSTA COFFEE', kind: 'CONTACTLESS', amount: -3.45 };

describe('bringing the same statement in again, whatever its end spaces', () => {
	beforeEach(() => {
		standing.switchedOn = ['books'];
		clearLedgerTables();
		ledgerTables.books_ledger_accounts = [{ id: bankId, code: '1200', name: 'Bank', account_type: 'asset', is_system: true, is_archived: false }];
	});

	it('adds nothing when the reference was kept with end spaces and comes again trimmed, and keeps the line as first given', async () => {
		await run('import_bank_lines', { applyRules: false, lines: [annys] });
		expect(await run('import_bank_lines', { applyRules: false, lines: [trimmed] })).toContain('0 added, 1 already there.');
		expect(heldBankLines()).toEqual([expect.objectContaining({ reference: 'ANNYS     ' })]);
	});

	it('adds nothing the other way round', async () => {
		await run('import_bank_lines', { applyRules: false, lines: [trimmed] });
		expect(await run('import_bank_lines', { applyRules: false, lines: [{ ...annys, counterparty: 'ANNYS  ' }] })).toContain('0 added, 1 already there.');
		expect(heldBankLines()).toHaveLength(1);
	});

	it('keeps two identical lines on one day, and adds a third when the statement holds three', async () => {
		expect(await run('import_bank_lines', { applyRules: false, lines: [coffee, coffee] })).toContain('2 added, 0 already there.');
		expect(await run('import_bank_lines', { applyRules: false, lines: [coffee, coffee, coffee] })).toContain('1 added, 2 already there.');
		expect(heldBankLines().map((line) => line.occurrence)).toEqual([1, 2, 3]);
	});
});
