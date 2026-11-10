import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ledgerTables } from './booksLedgerDatabase.fixture';
import { databaseStepStanding, standDatabaseStepsDown } from './booksLedgerCalls.fixture';
import { heldInvoice, holdDraftInvoice, invoiceId, journalsOfKind, runOnTheLedger as run, salesId } from './booksInvoicePostingWorld.fixture';

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Jewel Enterprises' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['books'] }));

const pay = (amount: number) => run('record_invoice_payment', { invoiceId, paidOn: '2026-11-20', amount });
const newLines = [{ description: 'Website build', quantity: 3, unitPrice: 500, incomeAccountId: salesId }];

/** Runs the work once, after the server has read the invoice and before the step locks it, as another caller could. */
function meanwhile(work: () => Promise<unknown>): void {
	databaseStepStanding.momentBetween = async () => {
		databaseStepStanding.momentBetween = null;
		await work();
	};
}

describe('two moves of one invoice at once', () => {
	beforeEach(async () => {
		standDatabaseStepsDown();
		holdDraftInvoice();
	});

	it('never lets two payments take more than the invoice owes: the second is refused and posts nothing', async () => {
		await run('issue_invoice', { invoiceId });
		meanwhile(() => pay(600));
		const answer = await pay(600);
		expect(answer).toBe('Nothing was posted. Invoice INV-6 stopped being issued, or came to owe less than £600.00, while the payment was being recorded; read_invoice says where it stands.');
		expect(ledgerTables.books_invoice_payments.map((payment) => payment.amount)).toEqual([600]);
		expect(journalsOfKind('invoice_payment')).toHaveLength(1);
		expect(heldInvoice().status).toBe('issued');
	});

	it('marks the invoice paid once, when two payments that together settle it arrive at once', async () => {
		await run('issue_invoice', { invoiceId });
		meanwhile(() => pay(20.5));
		expect(await pay(1000)).toContain('Recorded £1,000.00 received');
		expect(heldInvoice().status).toBe('paid');
		expect(journalsOfKind('invoice_payment')).toHaveLength(2);
	});

	it('refuses to issue a draft whose lines were replaced after it was read, posting nothing', async () => {
		meanwhile(() => run('update_draft_invoice', { invoiceId, lines: newLines }));
		const answer = await run('issue_invoice', { invoiceId });
		expect(answer).toContain('Nothing was posted. Invoice INV-6 stopped being the draft that was read');
		expect(heldInvoice().status).toBe('draft');
		expect(ledgerTables.books_journals).toEqual([]);
		expect(await run('issue_invoice', { invoiceId })).toContain('Jewel Bespoke Build owes £1,500.00');
	});

	it("refuses to swap the lines of a draft issued after it was read, leaving the issued invoice's lines as posted", async () => {
		meanwhile(() => run('issue_invoice', { invoiceId }));
		const answer = await run('update_draft_invoice', { invoiceId, lines: newLines });
		expect(answer).toBe('Nothing was saved. Invoice number 6 stopped being a draft while it was being changed; read_invoice says where it stands.');
		expect(ledgerTables.books_invoice_lines.map((line) => line.description)).toEqual(['Website build', 'Hosting']);
		expect(heldInvoice().status).toBe('issued');
	});

	it('refuses to void an invoice that took a payment after it was read, reversing nothing', async () => {
		await run('issue_invoice', { invoiceId });
		meanwhile(() => pay(100));
		const answer = await run('void_invoice', { invoiceId });
		expect(answer).toBe('Nothing was posted. Invoice INV-6 stopped being issued, or had a payment recorded, while it was being voided; read_invoice says where it stands.');
		expect(journalsOfKind('invoice_void')).toEqual([]);
		expect(heldInvoice().status).toBe('issued');
	});
});
