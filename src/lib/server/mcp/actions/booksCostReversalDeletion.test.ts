import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ledgerTables, ledgerWrites } from './booksLedgerDatabase.fixture';
import { deletionStepStanding, standDeletionStepsDown } from './booksLedgerCalls.fixture';
import { runOnTheLedger as run } from './booksInvoicePostingWorld.fixture';
import { heldExpense, holdChartForCosts, prepaymentsId, softwareId } from './booksExpenseWorld.fixture';

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Jewel Enterprises' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['books'] }));

const adobe = { expenseDate: '2026-11-05', supplier: 'Adobe', description: 'Creative Cloud', amount: 84.99, expenseAccountId: softwareId };

async function recordAdobe(): Promise<string> {
	await run('record_expense', adobe);
	return String(ledgerTables.books_expenses[0].id);
}

function journalOfAdobe(column: 'recorded_journal_id' | 'payment_journal_id'): string {
	return String(ledgerTables.books_expenses[0][column]);
}

function postReversalOf(reversedJournalId: string | null, description: string) {
	const lines = [
		{ accountId: prepaymentsId, debit: 84.99 },
		{ accountId: softwareId, credit: 84.99 }
	];
	return run('post_journal', { journalDate: '2026-11-12', description, lines, reversesJournalId: reversedJournalId });
}

function heldDeletions(): Record<string, unknown>[] {
	return ledgerTables.books_deletions ?? [];
}

const staysInTheBooks = 'It stays in the books as recorded and reversed.';

describe('deleting a cost whose posting another journal reverses', () => {
	beforeEach(() => {
		standDeletionStepsDown();
		holdChartForCosts();
	});

	it('refuses a cost whose recording is reversed, naming the reversal, and calls no delete', async () => {
		const adobeId = await recordAdobe();
		await postReversalOf(journalOfAdobe('recorded_journal_id'), 'Adobe recorded twice');
		const answer = await run('delete_expense', { expenseId: adobeId });
		expect(answer).toBe(
			'Nothing was deleted. The cost from Adobe was reversed in the ledger: its recording by the journal of 12 Nov 2026, ' +
				`"Adobe recorded twice". ${staysInTheBooks}`
		);
		expect(heldExpense(adobeId)).toBeDefined();
		expect(ledgerTables.books_journals).toHaveLength(2);
		expect(heldDeletions()).toEqual([]);
		expect(ledgerWrites.filter((write) => write.kind === 'rpc')).toEqual([]);
	});

	it('refuses a cost whose payment is reversed', async () => {
		const adobeId = await recordAdobe();
		await run('pay_expense', { expenseId: adobeId, paidOn: '2026-11-20' });
		await postReversalOf(journalOfAdobe('payment_journal_id'), 'Paid from the wrong account');
		const answer = await run('delete_expense', { expenseId: adobeId });
		expect(answer).toContain('its payment by the journal of 12 Nov 2026, "Paid from the wrong account"');
		expect(heldExpense(adobeId)).toBeDefined();
		expect(heldDeletions()).toEqual([]);
	});

	it('deletes nothing and keeps no record when the reversal is posted while the delete waits for its lock', async () => {
		const adobeId = await recordAdobe();
		deletionStepStanding.momentBetween = async () => {
			deletionStepStanding.momentBetween = null;
			await postReversalOf(journalOfAdobe('recorded_journal_id'), 'Adobe recorded twice');
		};
		const answer = await run('delete_expense', { expenseId: adobeId });
		expect(answer).toContain('Nothing was deleted. The cost from Adobe was reversed in the ledger: its recording by the journal of 12 Nov 2026');
		expect(answer).toContain(staysInTheBooks);
		expect(heldExpense(adobeId)).toBeDefined();
		expect(ledgerTables.books_journals).toHaveLength(2);
		expect(heldDeletions()).toEqual([]);
	});

	it('deletes a cost nothing reverses exactly as before, whatever else the ledger reverses', async () => {
		const adobeId = await recordAdobe();
		await postReversalOf(null, 'A journal of its own');
		await postReversalOf(String(ledgerTables.books_journals[1].id), 'Undo the journal of its own');
		const answer = await run('delete_expense', { expenseId: adobeId });
		expect(answer).toContain('Deleted the cost from Adobe dated 5 Nov 2026');
		expect(heldExpense(adobeId)).toBeUndefined();
		expect(ledgerTables.books_journals).toHaveLength(2);
		expect(heldDeletions()).toHaveLength(1);
	});
});
