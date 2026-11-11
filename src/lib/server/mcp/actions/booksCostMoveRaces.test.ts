import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ledgerTables } from './booksLedgerDatabase.fixture';
import { meanwhile, standDatabaseStepsDown } from './booksLedgerCalls.fixture';
import { journalsOfKind, runOnTheLedger as run } from './booksInvoicePostingWorld.fixture';
import { expenseId, heldExpense, holdUnpaidHosting } from './booksExpenseWorld.fixture';

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Jewel Enterprises' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['books'] }));

const payHosting = (paidOn: string) => run('pay_expense', { expenseId, paidOn });
const refused = 'Nothing was posted. The cost from Vercel was marked paid, or deleted, while this payment was being recorded; list_expenses says where it stands.';

describe('two moves of one cost at once', () => {
	beforeEach(() => {
		standDatabaseStepsDown();
		holdUnpaidHosting();
	});

	it('pays a cost once when two payments arrive at once: the second is refused and posts nothing', async () => {
		meanwhile(() => payHosting('2026-11-20'));
		expect(await payHosting('2026-11-21')).toBe(refused);
		const [payment] = journalsOfKind('expense_payment');
		expect(journalsOfKind('expense_payment')).toHaveLength(1);
		expect(heldExpense()).toEqual(expect.objectContaining({ paid_on: '2026-11-20', payment_journal_id: payment.id }));
	});

	it('posts no payment for a cost deleted after it was read', async () => {
		meanwhile(() => run('delete_expense', { expenseId }));
		expect(await payHosting('2026-11-20')).toBe(refused);
		expect(heldExpense()).toBeUndefined();
		expect(ledgerTables.books_journals).toEqual([]);
	});
});
