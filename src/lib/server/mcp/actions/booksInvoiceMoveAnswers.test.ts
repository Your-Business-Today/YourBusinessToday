import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ledgerTables, ledgerWrites } from './booksLedgerDatabase.fixture';
import { databaseStepStanding, standDatabaseStepsDown } from './booksLedgerCalls.fixture';
import { heldInvoice, holdDraftInvoice, invoiceId, journalsOfKind, runOnTheLedger as run, salesId } from './booksInvoicePostingWorld.fixture';

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Jewel Enterprises' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['books'] }));

const fetchFailed = { message: 'TypeError: fetch failed' };
const readFirst = 'read it before asking again, so nothing is posted twice.';
const newLines = [{ description: 'Website build', quantity: 3, unitPrice: 500, incomeAccountId: salesId }];

async function issueThenLoseAnswers(): Promise<void> {
	await run('issue_invoice', { invoiceId });
	databaseStepStanding.isAnswerLost = true;
}

function takenBack(): unknown[] {
	return ledgerWrites.filter((write) => write.kind === 'delete');
}

describe('a move of an invoice whose answer is lost', () => {
	beforeEach(() => {
		standDatabaseStepsDown();
		holdDraftInvoice();
	});

	it('says the invoice was issued when the step happened, keeping its one journal', async () => {
		databaseStepStanding.isAnswerLost = true;
		expect(await run('issue_invoice', { invoiceId })).toContain('Issued invoice INV-6 and posted its sale');
		const [sale] = journalsOfKind('invoice');
		expect(heldInvoice()).toEqual(expect.objectContaining({ status: 'issued', issued_journal_id: sale.id }));
		expect(journalsOfKind('invoice')).toHaveLength(1);
		expect(takenBack()).toEqual([]);
	});

	it('says the payment was recorded when the step happened, keeping the payment and its journal', async () => {
		await issueThenLoseAnswers();
		expect(await run('record_invoice_payment', { invoiceId, paidOn: '2026-11-20', amount: 1020.5 })).toContain('Recorded £1,020.50 received');
		const [payment] = journalsOfKind('invoice_payment');
		expect(ledgerTables.books_invoice_payments).toEqual([expect.objectContaining({ amount: 1020.5, journal_id: payment.id })]);
		expect(heldInvoice().status).toBe('paid');
		expect(takenBack()).toEqual([]);
	});

	it('says an issued invoice was voided, its sale reversed, and a draft voided, when each step happened', async () => {
		await issueThenLoseAnswers();
		expect(await run('void_invoice', { invoiceId })).toBe("Voided invoice INV-6 in Jewel Enterprises's books; its sale is reversed in the ledger.");
		expect(journalsOfKind('invoice_void')).toHaveLength(1);
		holdDraftInvoice();
		expect(await run('void_invoice', { invoiceId })).toBe("Voided invoice INV-6 in Jewel Enterprises's books; it had posted nothing, so nothing was reversed.");
		expect(heldInvoice().status).toBe('void');
	});

	it("says a draft's lines were saved when the step that swapped them happened", async () => {
		databaseStepStanding.isAnswerLost = true;
		expect(await run('update_draft_invoice', { invoiceId, lines: newLines })).toContain('- Website build: 3 × £500.00 = £1,500.00');
		expect(ledgerTables.books_invoice_lines.map((line) => line.description)).toEqual(['Website build']);
	});
});

describe('a move of an invoice that fails in the database', () => {
	beforeEach(() => {
		standDatabaseStepsDown();
		holdDraftInvoice();
	});

	it('leaves nothing posted or changed, takes nothing back, and says to read the invoice before asking again', async () => {
		databaseStepStanding.refusal = fetchFailed;
		const answer = await run('issue_invoice', { invoiceId });
		expect(answer).toBe(`It could not be told whether invoice INV-6 was issued (TypeError: fetch failed). read_invoice says where invoice INV-6 stands; ${readFirst}`);
		expect(heldInvoice().status).toBe('draft');
		expect(ledgerTables.books_journals).toEqual([]);
		expect(takenBack()).toEqual([]);
	});

	it('says the same of a payment, a void and new lines, and leaves the invoice as it stood', async () => {
		await run('issue_invoice', { invoiceId });
		databaseStepStanding.refusal = fetchFailed;
		expect(await run('record_invoice_payment', { invoiceId, paidOn: '2026-11-20', amount: 10 })).toContain('was paid £10.00 (TypeError: fetch failed)');
		expect(await run('void_invoice', { invoiceId })).toContain('It could not be told whether invoice INV-6 was voided');
		heldInvoice().status = 'draft';
		expect(await run('update_draft_invoice', { invoiceId, lines: newLines })).toContain('whether invoice number 6 was given its new lines');
		expect(ledgerTables.books_invoice_payments).toEqual([]);
		expect(ledgerTables.books_invoice_lines).toHaveLength(2);
		expect(journalsOfKind('invoice_void')).toEqual([]);
	});
});
