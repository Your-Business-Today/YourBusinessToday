import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ledgerTables, ledgerWrites } from './booksLedgerDatabase.fixture';
import { databaseStepStanding, standDatabaseStepsDown } from './booksLedgerCalls.fixture';
import { journalRefusal } from './booksStepJournal.fixture';
import { journalsOfKind, runOnTheLedger as run } from './booksInvoicePostingWorld.fixture';
import { holdChartForCosts, softwareId } from './booksExpenseWorld.fixture';

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Jewel Enterprises' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['books'] }));

const auditFee = { monthKey: '2026-11', amount: 450, description: 'Audit fee', expenseAccountId: softwareId };
const insurance = { firstMonthKey: '2026-11', monthCount: 3, totalAmount: 100, description: 'Insurance', expenseAccountId: softwareId };
const whereItStands = 'explain_account_balance says what the expense account holds; read it before asking again, so nothing is posted twice.';
const stepsCalled = () => ledgerWrites.filter((write) => write.kind === 'rpc').map((write) => write.table);
const takenBack = () => ledgerWrites.filter((write) => write.kind === 'delete');

describe('posting a month end in one step', () => {
	beforeEach(() => {
		standDatabaseStepsDown();
		holdChartForCosts();
	});

	it('posts an accrual and its reversal in one call, and every month of a release in another', async () => {
		await run('create_accrual', auditFee);
		await run('create_prepayment_release', insurance);
		expect(stepsCalled()).toEqual(['post_books_journal_set', 'post_books_journal_set']);
		expect(journalsOfKind('accrual_reversal')[0].reverses_journal_id).toBe(journalsOfKind('accrual')[0].id);
		expect(journalsOfKind('prepayment_release')).toHaveLength(3);
	});

	it('leaves no accrual standing when its reversal cannot be posted, taking nothing back', async () => {
		journalRefusal.atJournal = 2;
		expect(await run('create_accrual', auditFee)).toBe(
			`It could not be told whether the accrual of £450.00 for Audit fee was posted with its reversal (Journal ${String(lastSetJournalId(2))} names an account the books no longer hold). ${whereItStands}`
		);
		expect(ledgerTables.books_journals).toEqual([]);
		expect(ledgerTables.books_journal_lines).toEqual([]);
		expect(takenBack()).toEqual([]);
	});

	it('leaves no month of a release posted when a later month fails', async () => {
		journalRefusal.atJournal = 3;
		expect(await run('create_prepayment_release', insurance)).toContain('It could not be told whether the release of £100.00 for Insurance was posted');
		expect(ledgerTables.books_journals).toEqual([]);
		expect(ledgerTables.books_journal_lines).toEqual([]);
		expect(takenBack()).toEqual([]);
	});

	it('says an accrual and a release were posted when their steps happened though the answers were lost, posting each once', async () => {
		databaseStepStanding.isAnswerLost = true;
		expect(await run('create_accrual', auditFee)).toContain('Accrued £450.00 for Audit fee');
		expect(await run('create_prepayment_release', insurance)).toContain('Spread £100.00 for Insurance across 3 months');
		expect(ledgerTables.books_journals.map((journal) => journal.kind)).toEqual(['accrual', 'accrual_reversal', ...Array(3).fill('prepayment_release')]);
	});
});

function lastSetJournalId(position: number): unknown {
	const [setCall] = ledgerWrites.filter((write) => write.table === 'post_books_journal_set').slice(-1);
	const journals = (setCall.row as { journals: { id: unknown }[] }).journals;
	return journals[position - 1].id;
}
