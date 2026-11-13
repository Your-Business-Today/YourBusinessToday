import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ledgerTables } from './booksLedgerDatabase.fixture';
import { journalsOfKind, postedLines } from './booksInvoicePostingWorld.fixture';
import { runOnTheBankLines as run } from './booksBankLineDatabase.fixture';
import { bankId, heldLine, holdBooksWithAStatement, lineIds, loanId, softwareId } from './booksBankMatchWorld.fixture';

const standing = vi.hoisted(() => ({ switchedOn: ['books'] as string[] }));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Your Business Today' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => standing.switchedOn }));

const nigelLoanId = '00000000-0000-4000-8000-000000002310';
const adobeIsSoftware = { counterparty: 'ADOBE', direction: 'out', cost: { expenseAccountId: softwareId, description: 'Creative Cloud' } };
const jamesLends = { counterparty: 'Beadle EM & GJ', direction: 'either', account: { accountId: loanId, description: 'Loan from James' } };
const nigelLends = { counterparty: 'nigel davies', direction: 'either', account: { accountId: nigelLoanId, description: 'Loan from Nigel' } };

const november: [string, string, number][] = [
	['2026-11-03', 'JEWEL BESPOKE BUILD', 1020.5],
	['2026-11-05', 'ADOBE', -84.99],
	['2026-11-06', 'BEADLE EM & GJ', 500],
	['2026-11-07', ' NIGEL DAVIES ', -200],
	['2026-11-08', 'COSTA COFFEE', -3.45]
];
const novemberLines = november.map(([date, counterparty, amount]) => ({ date, counterparty, amount }));

const lineFrom = (counterparty: string) => (ledgerTables.books_bank_lines ?? []).find((line) => line.counterparty === counterparty) ?? {};

describe('the books remember who is always what', () => {
	beforeEach(async () => {
		standing.switchedOn = ['books'];
		await holdBooksWithAStatement();
		const nigelLoan = { id: nigelLoanId, code: '2310', name: 'Loan account: Nigel', account_type: 'liability', is_system: false, is_archived: false };
		ledgerTables.books_ledger_accounts.push(nigelLoan);
	});

	it('matches the lines already there that a rule set with applyNow covers, and setting it again matches nothing more', async () => {
		const first = await run('set_bank_rule', { ...adobeIsSoftware, applyNow: true });
		expect(first).toContain("Set in Your Business Today's books: Lines from ADOBE, money out, are a cost on 6000 Software, \"Creative Cloud\".");
		expect(first).toContain('The rules matched 1, each posted on its line\'s day:\n- the line of 5 Nov 2026 with ADOBE for -£84.99, as a cost from ADOBE for Creative Cloud, paid that day');
		expect(heldLine(lineIds.adobe)).toEqual(expect.objectContaining({ matched_as: 'cost' }));
		expect(heldLine(lineIds.coffee).matched_journal_id).toBeNull();
		const again = await run('set_bank_rule', { ...adobeIsSoftware, applyNow: true });
		expect(again).toContain('It replaces: Lines from ADOBE, money out, are a cost on 6000 Software');
		expect(again).toContain('No unmatched line a rule covers was there to match.');
		expect(ledgerTables.books_bank_rules).toHaveLength(1);
		expect(ledgerTables.books_expenses).toHaveLength(1);
	});

	it("brings a month in with applyRules, matching software and two partners' loans and leaving the rest", async () => {
		for (const rule of [adobeIsSoftware, jamesLends, nigelLends]) await run('set_bank_rule', { ...rule, applyNow: false });
		ledgerTables.books_bank_lines = [];
		const answer = await run('import_bank_lines', { applyRules: true, lines: novemberLines });
		expect(answer).toContain('5 added, 0 already there.');
		expect(answer).toContain('The rules matched 3');
		expect(answer).toContain('as money moving to or from 2300 Loan account: James: Loan from James');
		expect(answer).toContain('2 left unmatched in the statement\'s days, for match_bank_line.');
		expect(lineFrom('ADOBE').matched_as).toBe('cost');
		expect(lineFrom(' NIGEL DAVIES ').matched_as).toBe('account');
		expect(lineFrom('JEWEL BESPOKE BUILD').matched_journal_id).toBeNull();
		expect(lineFrom('COSTA COFFEE').matched_journal_id).toBeNull();
		const [james, nigel] = journalsOfKind('manual');
		expect(postedLines(james.id)).toEqual([
			{ accountId: bankId, costCentreId: null, debit: 500, credit: 0 },
			{ accountId: loanId, costCentreId: null, debit: 0, credit: 500 }
		]);
		expect(postedLines(nigel.id)).toEqual([
			{ accountId: nigelLoanId, costCentreId: null, debit: 200, credit: 0 },
			{ accountId: bankId, costCentreId: null, debit: 0, credit: 200 }
		]);
	});

	it('keeps the lines unmatched when applyRules is false, and refuses an import that does not say', async () => {
		await run('set_bank_rule', { ...adobeIsSoftware, applyNow: false });
		ledgerTables.books_bank_lines = [];
		const kept = await run('import_bank_lines', { applyRules: false, lines: novemberLines });
		expect(kept).toContain('The rules were not applied; match_bank_line matches each line.');
		expect(lineFrom('ADOBE').matched_journal_id).toBeNull();
		const unsaid = await run('import_bank_lines', { lines: novemberLines });
		expect(unsaid).toBe('Nothing was saved. applyRules is true or false, always stated; undefined was given.');
	});
});
