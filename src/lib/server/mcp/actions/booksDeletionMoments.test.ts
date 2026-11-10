import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ledgerTables } from './booksLedgerDatabase.fixture';
import { deletionStepStanding, standDeletionStepsDown } from './booksLedgerCalls.fixture';
import { heldInvoice, holdDraftInvoice, invoiceId, runOnTheLedger as run } from './booksInvoicePostingWorld.fixture';
import { heldExpense, holdChartForCosts, softwareId } from './booksExpenseWorld.fixture';

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Jewel Enterprises' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['books'] }));

const adobe = { expenseDate: '2026-11-05', supplier: 'Adobe', description: 'Creative Cloud', amount: 84.99, expenseAccountId: softwareId };

function heldDeletions(): Record<string, unknown>[] {
	return ledgerTables.books_deletions ?? [];
}

async function recordAdobe(): Promise<string> {
	holdChartForCosts();
	await run('record_expense', adobe);
	return String(ledgerTables.books_expenses[0].id);
}

describe('the record kept at the moment of deleting from the books', () => {
	beforeEach(() => {
		standDeletionStepsDown();
		holdDraftInvoice();
	});

	it('keeps the payment journal of a cost paid between reading it and deleting it', async () => {
		const adobeId = await recordAdobe();
		deletionStepStanding.momentBetween = async () => {
			deletionStepStanding.momentBetween = null;
			await run('pay_expense', { expenseId: adobeId, paidOn: '2026-11-20' });
		};
		await run('delete_expense', { expenseId: adobeId });
		expect(heldExpense(adobeId)).toBeUndefined();
		expect(ledgerTables.books_journals).toEqual([]);
		const [deletion] = heldDeletions();
		expect(deletion.record).toEqual(expect.objectContaining({ paid_on: '2026-11-20' }));
		const journals = deletion.journals as { kind: string; lines: unknown[] }[];
		expect(journals.map(({ kind, lines }) => [kind, lines.length])).toEqual([['expense', 2], ['expense_payment', 2]]);
	});

	it('keeps the lines a draft invoice has at the moment it goes, not the ones it had when it was read', async () => {
		deletionStepStanding.momentBetween = async () => {
			ledgerTables.books_invoice_lines = ledgerTables.books_invoice_lines.filter((line) => line.description === 'Hosting');
		};
		await run('delete_invoice', { invoiceId });
		const record = heldDeletions()[0].record as { lines: { description: string }[] };
		expect(record.lines.map((line) => line.description)).toEqual(['Hosting']);
	});

	it('says a cost was deleted, naming its record, when the delete happened but its answer never came back', async () => {
		const adobeId = await recordAdobe();
		deletionStepStanding.isAnswerLost = true;
		const answer = await run('delete_expense', { expenseId: adobeId });
		const [deletion] = heldDeletions();
		expect(answer).toContain("Deleted the cost from Adobe dated 5 Nov 2026 from Jewel Enterprises's books");
		expect(answer).toContain(`kept as deletion ${deletion.id}`);
		expect(heldExpense(adobeId)).toBeUndefined();
	});

	it('says an invoice was deleted, naming its record, when the answer was lost', async () => {
		deletionStepStanding.isAnswerLost = true;
		const answer = await run('delete_invoice', { invoiceId });
		expect(answer).toContain(`Deleted draft invoice INV-6 to Jewel Bespoke Build from Jewel Enterprises's books. A record`);
		expect(answer).toContain(`kept as deletion ${heldDeletions()[0].id}`);
	});

	it('reports an error that leaves nothing deleted as the error, never as deleted meanwhile', async () => {
		deletionStepStanding.refusal = { message: 'TypeError: fetch failed' };
		await expect(run('delete_invoice', { invoiceId })).rejects.toEqual({ message: 'TypeError: fetch failed' });
		expect(heldInvoice()).toEqual(expect.objectContaining({ status: 'draft' }));
		expect(heldDeletions()).toEqual([]);
	});

	it('deletes nothing and keeps no record when an invoice takes a payment or is issued before it goes', async () => {
		deletionStepStanding.momentBetween = async () => {
			ledgerTables.books_invoice_payments = [{ id: 'payment-1', invoice_id: invoiceId, paid_on: '2026-11-03', amount: 10 }];
		};
		const answer = await run('delete_invoice', { invoiceId });
		expect(answer).toBe('Nothing was deleted. Invoice INV-6 stopped being draft, or had a payment recorded, while it was being deleted; read_invoice says where it stands.');
		expect(heldInvoice()).toEqual(expect.objectContaining({ status: 'draft' }));
		expect(heldDeletions()).toEqual([]);
	});
});
