import { beforeEach, describe, expect, it, vi } from 'vitest';
import { moduleNotSwitchedOn } from '../organisationModuleGate';
import { ledgerTables, ledgerWrites } from './booksLedgerDatabase.fixture';
import { costDeleteFailure, nigelAccountId } from './booksLedgerCalls.fixture';
import { holdDraftInvoice, invoiceId, organisationId, runOnTheLedger as run } from './booksInvoicePostingWorld.fixture';
import { heldExpense, holdChartForCosts, softwareId } from './booksExpenseWorld.fixture';

const standing = vi.hoisted(() => ({ switchedOn: [] as string[] }));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Jewel Enterprises' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => standing.switchedOn }));

const adobe = { expenseDate: '2026-11-05', supplier: 'Adobe', description: 'Creative Cloud', amount: 84.99, expenseAccountId: softwareId };
const deletedAt = '2026-11-10T20:15:00Z';

function heldDeletions(): Record<string, unknown>[] {
	return (ledgerTables.books_deletions ?? []).map((deletion) => Object.assign(deletion, { deleted_at: deletedAt }));
}

async function recordAndPayAdobe(): Promise<string> {
	await run('record_expense', adobe);
	const adobeId = String(ledgerTables.books_expenses[0].id);
	await run('pay_expense', { expenseId: adobeId, paidOn: '2026-11-20' });
	return adobeId;
}

describe('the record of what is deleted from the books', () => {
	beforeEach(() => {
		standing.switchedOn = ['books'];
		costDeleteFailure.error = null;
		holdDraftInvoice();
	});

	it('reads nothing for an organisation without Books', async () => {
		standing.switchedOn = [];
		expect(await run('list_books_deletions', {})).toBe(moduleNotSwitchedOn('books'));
		expect(await run('read_books_deletion', { deletionId: invoiceId })).toBe(moduleNotSwitchedOn('books'));
	});

	it('keeps a draft invoice with its lines, who deleted it and when, before the invoice goes', async () => {
		await run('delete_invoice', { invoiceId });
		const [deletion] = heldDeletions();
		expect(deletion).toEqual(expect.objectContaining({ organisation_id: organisationId, kind: 'invoice', record_id: invoiceId, known_as: 'INV-6' }));
		expect(deletion).toEqual(expect.objectContaining({ deleted_by_account_id: nigelAccountId, journals: [] }));
		const record = deletion.record as Record<string, unknown>;
		expect(record).toEqual(expect.objectContaining({ invoice_number: 6, status: 'draft', customer_name: 'Jewel Bespoke Build' }));
		expect((record.lines as { description: string }[]).map((line) => line.description)).toEqual(['Website build', 'Hosting']);
		expect(ledgerWrites.map((write) => `${write.kind} ${write.table}`)).toEqual(['insert books_deletions', 'delete books_invoices']);
		const listed = await run('list_books_deletions', {});
		expect(listed).toContain("Deleted from Jewel Enterprises's books, newest first. 1 shown.");
		expect(listed).toContain('- 10 Nov 2026 at 20:15: draft invoice INV-6 to Jewel Bespoke Build dated 1 Nov 2026, with 2 lines; deleted by Nigel.');
	});

	it('keeps a cost with the journals it posted and their lines, and takes the cost and its journals out together', async () => {
		holdChartForCosts();
		const adobeId = await recordAndPayAdobe();
		await run('delete_expense', { expenseId: adobeId });
		expect(heldExpense(adobeId)).toBeUndefined();
		expect(ledgerTables.books_journals).toEqual([]);
		expect(ledgerTables.books_journal_lines).toEqual([]);
		const [deletion] = heldDeletions();
		expect(deletion).toEqual(expect.objectContaining({ kind: 'cost', record_id: adobeId, known_as: 'Adobe', deleted_by_account_id: nigelAccountId }));
		const journals = deletion.journals as { kind: string; lines: unknown[] }[];
		expect(journals.map((journal) => [journal.kind, journal.lines.length])).toEqual([['expense', 2], ['expense_payment', 2]]);
		expect(await run('list_books_deletions', {})).toContain('cost from Adobe dated 5 Nov 2026, £84.99, with 2 journals; deleted by Nigel.');
		const copy = await run('read_books_deletion', { deletionId: deletion.id });
		expect(copy).toContain('The copy, as the books held it:');
		expect(copy).toContain('"supplier": "Adobe"');
		expect(copy).toContain('"kind": "expense_payment"');
	});

	it('takes the record back when the database refuses the delete, leaving the cost and its journals as they were', async () => {
		holdChartForCosts();
		const adobeId = await recordAndPayAdobe();
		costDeleteFailure.error = { message: 'refused' };
		await expect(run('delete_expense', { expenseId: adobeId })).rejects.toEqual({ message: 'refused' });
		expect(ledgerTables.books_deletions).toEqual([]);
		expect(heldExpense(adobeId)).toBeDefined();
		expect(ledgerTables.books_journals).toHaveLength(2);
	});

	it('says when nothing has been deleted, and refuses a deletion that is not an id or not recorded', async () => {
		expect(await run('list_books_deletions', {})).toBe("Nothing has been deleted from Jewel Enterprises's books.");
		expect(await run('read_books_deletion', { deletionId: 'first' })).toContain('No reading was taken. The deletion must be an id');
		expect(await run('read_books_deletion', { deletionId: invoiceId })).toContain(`No deletion ${invoiceId} is recorded`);
	});
});
