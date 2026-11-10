import { beforeEach, describe, expect, it, vi } from 'vitest';
import { moduleNotSwitchedOn } from '../organisationModuleGate';
import { ledgerTables, ledgerWrites } from './booksLedgerDatabase.fixture';
import { accountIdOfCode, journalsOfKind, postedLines, runOnTheLedger as run, writesTo } from './booksInvoicePostingWorld.fixture';
import { holdChartForCosts, prepaymentsId, projectsId, softwareId } from './booksExpenseWorld.fixture';

const standing = vi.hoisted(() => ({ switchedOn: [] as string[] }));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Jewel Enterprises' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => standing.switchedOn }));

const auditFee = { monthKey: '2026-11', amount: 450, description: 'Audit fee', expenseAccountId: softwareId };
const insurance = { firstMonthKey: '2026-11', monthCount: 3, totalAmount: 100, description: 'Insurance', expenseAccountId: softwareId };

describe('closing a month', () => {
	beforeEach(() => {
		standing.switchedOn = ['books'];
		holdChartForCosts();
	});

	it('changes nothing for an organisation without Books', async () => {
		standing.switchedOn = [];
		expect(await run('create_accrual', auditFee)).toBe(moduleNotSwitchedOn('books'));
		expect(await run('create_prepayment_release', insurance)).toBe(moduleNotSwitchedOn('books'));
		expect(ledgerWrites).toEqual([]);
	});

	it('accrues a cost at the month end against Accruals, opened as a system account, and reverses it the next day', async () => {
		const answer = await run('create_accrual', { ...auditFee, costCentreId: projectsId });
		expect(answer).toBe(
			"Accrued £450.00 for Audit fee in Jewel Enterprises's books: posted on 30 Nov 2026 to 6100 Software, cost centre Projects " +
				'and owed on Accruals, then reversed on 1 Dec 2026, so the bill posts the cost once when record_expense records it.'
		);
		const openedAccruals = { code: '2200', name: 'Accruals', account_type: 'liability', is_system: true };
		expect(writesTo('books_ledger_accounts')[0].row).toEqual(expect.objectContaining(openedAccruals));
		const [accrual] = journalsOfKind('accrual');
		const [reversal] = journalsOfKind('accrual_reversal');
		expect(accrual).toEqual(expect.objectContaining({ journal_date: '2026-11-30', description: 'Accrual: Audit fee' }));
		expect(reversal).toEqual(expect.objectContaining({ journal_date: '2026-12-01', reverses_journal_id: accrual.id }));
		const accrualsId = accountIdOfCode('2200');
		expect(postedLines(accrual.id)).toEqual([
			{ accountId: softwareId, costCentreId: projectsId, debit: 450, credit: 0 },
			{ accountId: accrualsId, costCentreId: null, debit: 0, credit: 450 }
		]);
		expect(postedLines(reversal.id)).toEqual([
			{ accountId: accrualsId, costCentreId: null, debit: 450, credit: 0 },
			{ accountId: softwareId, costCentreId: projectsId, debit: 0, credit: 450 }
		]);
	});

	it('spreads a prepayment across its months, a share out of Prepayments at each month end', async () => {
		const answer = await run('create_prepayment_release', insurance);
		expect(answer).toBe(
			"Spread £100.00 for Insurance across 3 months in Jewel Enterprises's books, moving each month's share out of " +
				'Prepayments to 6100 Software:\n- November 2026: £33.33\n- December 2026: £33.33\n- January 2027: £33.34'
		);
		const releases = journalsOfKind('prepayment_release');
		expect(releases.map((journal) => journal.journal_date)).toEqual(['2026-11-30', '2026-12-31', '2027-01-31']);
		expect(releases[0].description).toBe('Prepayment release: Insurance (November 2026)');
		expect(postedLines(releases[2].id)).toEqual([
			{ accountId: softwareId, costCentreId: null, debit: 33.34, credit: 0 },
			{ accountId: prepaymentsId, costCentreId: null, debit: 0, credit: 33.34 }
		]);
		expect(writesTo('books_ledger_accounts')).toEqual([]);
	});

	it('refuses what the columns cannot hold, or an account month end does not post a cost to, posting nothing', async () => {
		expect(await run('create_accrual', { ...auditFee, monthKey: '2026-11-30' })).toBe(
			'Nothing was posted. monthKey is a month written as 2026-11; "2026-11-30" was given.'
		);
		expect(await run('create_accrual', { ...auditFee, amount: -450 })).toBe('Nothing was posted. amount cannot be below zero; -450 was given.');
		expect(await run('create_prepayment_release', { ...insurance, monthCount: 48 })).toContain('from 1 to 36; 48 was given');
		const toPrepayments = await run('create_accrual', { ...auditFee, expenseAccountId: prepaymentsId });
		expect(toPrepayments).toContain('is 1300, of type asset; month end posts a cost to an expense account');
		expect(ledgerWrites).toEqual([]);
	});

	it('refuses to post Accruals over another kind of account kept at 2200', async () => {
		const loan = { id: '00000000-0000-4000-8000-000000002200', code: '2200', name: 'Director loan', account_type: 'asset', is_system: false, is_archived: false };
		ledgerTables.books_ledger_accounts.push(loan);
		const answer = await run('create_accrual', auditFee);
		expect(answer).toContain('Nothing was posted. The books post Accruals to code 2200 as an liability account');
		expect(ledgerWrites).toEqual([]);
	});
});
