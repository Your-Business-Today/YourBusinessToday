import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ledgerTables } from './booksLedgerDatabase.fixture';
import { accountIdOfCode, journalsOfKind, postedLines, runOnTheLedger as run } from './booksInvoicePostingWorld.fixture';
import { heldExpense, holdUnpaidHosting, softwareId } from './booksExpenseWorld.fixture';

const standing = vi.hoisted(() => ({ switchedOn: [] as string[] }));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Jewel Enterprises' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => standing.switchedOn }));

const adobe = { expenseDate: '2026-11-05', supplier: 'Adobe', description: 'Creative Cloud', amount: 84.99, expenseAccountId: softwareId };

describe('paying, listing and deleting a supplier cost', () => {
	beforeEach(() => {
		standing.switchedOn = ['books'];
		holdUnpaidHosting();
	});

	it('pays an unpaid cost off trade creditors and out of the bank, and refuses to pay it twice', async () => {
		const answer = await run('pay_expense', { expenseId: heldExpense()?.id, paidOn: '2026-11-20' });
		expect(answer).toContain('Marked the cost paid on 20 Nov 2026 and posted the payment from the bank');
		const [payment] = journalsOfKind('expense_payment');
		expect(payment).toEqual(expect.objectContaining({ journal_date: '2026-11-20', description: 'Paid Vercel: Hosting' }));
		expect(postedLines(payment.id)).toEqual([
			{ accountId: accountIdOfCode('2100'), costCentreId: null, debit: 20, credit: 0 },
			{ accountId: accountIdOfCode('1200'), costCentreId: null, debit: 0, credit: 20 }
		]);
		expect(heldExpense()).toEqual(expect.objectContaining({ paid_on: '2026-11-20', payment_journal_id: payment.id }));
		const secondPayment = await run('pay_expense', { expenseId: heldExpense()?.id, paidOn: '2026-11-21' });
		expect(secondPayment).toBe('Nothing was posted. The cost from Vercel was paid on 20 Nov 2026 already.');
	});

	it('lists the costs with what is still owed, and only the unpaid ones when asked', async () => {
		await run('record_expense', { ...adobe, isPaid: true });
		const every = await run('list_expenses', {});
		expect(every).toContain("Costs of Jewel Enterprises, newest first. 2 shown, 1 unpaid, owing £20.00.");
		expect(every).toContain('- 5 Nov 2026: Adobe, Creative Cloud, £84.99; 6100 Software; paid 5 Nov 2026.');
		expect(await run('list_expenses', { isUnpaidOnly: true })).not.toContain('Adobe');
		expect(await run('list_expenses', { isUnpaidOnly: 'yes' })).toBe('No reading was taken. isUnpaidOnly is true or false; "yes" was given.');
	});

	it('deletes a cost recorded by mistake with its recording and its payment, leaving other journals alone', async () => {
		ledgerTables.books_journals.push({ id: 'manual-1', kind: 'manual' });
		await run('record_expense', adobe);
		const adobeId = ledgerTables.books_expenses[1].id;
		await run('pay_expense', { expenseId: adobeId, paidOn: '2026-11-20' });
		expect(ledgerTables.books_journals.map((journal) => journal.kind)).toEqual(['manual', 'expense', 'expense_payment']);
		const deleted = await run('delete_expense', { expenseId: adobeId });
		expect(deleted).toContain("Deleted the cost from Adobe dated 5 Nov 2026 from Jewel Enterprises's books, with the journals it posted.");
		expect(deleted).toContain(`A record of what was deleted is kept as deletion ${ledgerTables.books_deletions[0].id}; read_books_deletion reads it.`);
		expect(heldExpense(adobeId)).toBeUndefined();
		expect(ledgerTables.books_journals.map((journal) => journal.id)).toEqual(['manual-1']);
		expect(await run('delete_expense', { expenseId: 'mistake' })).toContain('Nothing was deleted. The expense must be an id');
	});
});
