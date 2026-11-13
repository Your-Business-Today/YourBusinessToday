import { beforeEach, describe, expect, it, vi } from 'vitest';
import { moduleNotSwitchedOn } from '../organisationModuleGate';
import { clearLedgerTables, ledgerTables, ledgerWrites } from './booksLedgerDatabase.fixture';
import { heldBankLines, runOnTheBankLines as run } from './booksBankLineDatabase.fixture';
import { seventyEightLineStatement, withoutBalances } from './booksBankStatement.fixture';

const standing = vi.hoisted(() => ({ switchedOn: [] as string[] }));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Your Business Today' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => standing.switchedOn }));

const bankId = '00000000-0000-4000-8000-000000001200';
const coffee = { date: '2026-11-05', counterparty: 'COSTA COFFEE', kind: 'CONTACTLESS', amount: -3.45 };

describe('bringing a bank statement into the books', () => {
	beforeEach(() => {
		standing.switchedOn = ['books'];
		clearLedgerTables();
		ledgerTables.books_ledger_accounts = [{ id: bankId, code: '1200', name: 'Bank', account_type: 'asset', is_system: true, is_archived: false }];
	});

	it('keeps nothing and reads nothing for an organisation without Books', async () => {
		standing.switchedOn = [];
		expect(await run('import_bank_lines', { lines: [coffee] })).toBe(moduleNotSwitchedOn('books'));
		expect(await run('list_bank_lines', {})).toBe(moduleNotSwitchedOn('books'));
		expect(ledgerWrites).toEqual([]);
	});

	it('brings 78 lines in on the Bank account, and the same statement again adds none', async () => {
		const lines = seventyEightLineStatement();
		const first = await run('import_bank_lines', { lines });
		expect(first).toContain("Brought the statement into Your Business Today's books on 1200 Bank: 78 added, 0 already there.");
		expect(first).toContain('The lines run from 30 Jul 2026 to');
		expect(first).toContain('The balances given agree with the amounts (77 checked).');
		expect(heldBankLines()).toHaveLength(78);
		expect(heldBankLines()[0]).toEqual(expect.objectContaining({ bank_account_id: bankId, line_date: '2026-07-30', position: 1, occurrence: 1 }));
		expect(await run('import_bank_lines', { lines })).toContain('0 added, 78 already there.');
		expect(heldBankLines()).toHaveLength(78);
	});

	it('keeps two identical lines on one day as two, and an overlapping statement adds only what is new', async () => {
		expect(await run('import_bank_lines', { lines: [coffee, coffee] })).toContain('2 added, 0 already there.');
		expect(heldBankLines().map((line) => line.occurrence)).toEqual([1, 2]);
		const later = { ...coffee, date: '2026-11-06' };
		expect(await run('import_bank_lines', { lines: [coffee, coffee, later] })).toContain('1 added, 2 already there.');
	});

	it('refuses the whole call by the line number and field, keeping nothing', async () => {
		const threePlaces = await run('import_bank_lines', { lines: [coffee, { ...coffee, amount: -3.456 }] });
		expect(threePlaces).toBe('Nothing was saved. Line 2: amount has at most 2 decimal places; -3.456 was given.');
		const nothingAtAll = await run('import_bank_lines', { lines: [{ ...coffee, amount: 0 }] });
		expect(nothingAtAll).toBe('Nothing was saved. Line 1: amount is money in above zero or money out below zero; 0 was given.');
		const noAmount = await run('import_bank_lines', { lines: [{ ...coffee, amount: undefined }] });
		expect(noAmount).toContain('Nothing was saved. Line 1: amount is an amount in pounds');
		const longName = await run('import_bank_lines', { lines: [{ ...coffee, counterparty: 'C'.repeat(201) }] });
		expect(longName).toBe('Nothing was saved. Line 1: counterparty is at most 200 characters; 201 were given.');
		const backwards = await run('import_bank_lines', { lines: [coffee, { ...coffee, date: '2026-11-04' }] });
		expect(backwards).toContain('Line 2: date 2026-11-04 is before the line above it (2026-11-05). Give the lines oldest first');
		expect(await run('import_bank_lines', { lines: [] })).toContain('lines is a list of 1 to 500 statement lines; 0 were given.');
		expect(heldBankLines()).toEqual([]);
	});

	it('says which balance does not follow from the line above it, and when none could be checked', async () => {
		const lines = seventyEightLineStatement().slice(0, 3);
		lines[2] = { ...lines[2], balanceAfter: lines[2].balanceAfter + 1 };
		const answer = await run('import_bank_lines', { lines });
		expect(answer).toContain("line 3's balance £474.60 is not the £482.00 above it plus its -£8.40.");
		expect(await run('import_bank_lines', { lines: withoutBalances(lines) })).toContain('none was checked');
	});

	it('refuses an account a statement cannot be of', async () => {
		ledgerTables.books_ledger_accounts.push({ id: 'sales', code: '4000', name: 'Sales', account_type: 'income', is_system: true, is_archived: false });
		const toSales = await run('import_bank_lines', { bankAccountCode: '4000', lines: [coffee] });
		expect(toSales).toBe('Nothing was saved. 4000 Sales is of type income; a statement is of a bank or card account, an asset or a liability.');
		expect(await run('import_bank_lines', { bankAccountCode: '1210', lines: [coffee] })).toContain('No account 1210 is in this chart');
	});
});
