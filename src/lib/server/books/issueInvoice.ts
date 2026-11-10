import type { SupabaseClient } from '@supabase/supabase-js';
import { issueRefusal } from '$lib/data/books/invoiceMoveRules';
import { issueLines } from '$lib/data/books/invoicePostings';
import { InvoiceStatuses } from '$lib/data/books/invoiceStatuses';
import { InvoiceJournalKinds } from '$lib/data/books/journalKinds';
import { SystemAccounts } from '$lib/data/books/systemAccounts';
import { refuseWhen } from './booksRefusal';
import { findHeldInvoice, type HeldInvoice } from './heldInvoice';
import { moveInvoiceOrWithdraw } from './invoiceStatusMoves';
import { postJournal } from './postJournal';
import { findOrOpenSystemAccount } from './systemAccounts';

/**
 * Issues one of the organisation's draft invoices: the sale posts to the ledger on the day the invoice is dated, the
 * customer owing its total on trade debtors and each line credited to its income account, and the invoice is issued
 * with the journal that posted it. A draft that has moved on meanwhile is refused, and its journal taken back out.
 */
export async function issueInvoice(supabase: SupabaseClient, organisationId: string, invoiceId: unknown): Promise<HeldInvoice> {
	const invoice = await findHeldInvoice(supabase, organisationId, invoiceId);
	refuseWhen(issueRefusal(invoice));
	const debtorsAccountId = await findOrOpenSystemAccount(supabase, organisationId, SystemAccounts.tradeDebtors);
	const journalId = await postJournal(supabase, organisationId, {
		journalDate: invoice.issueDate,
		description: `Invoice ${invoice.printedNumber} to ${invoice.customerName}`,
		kind: InvoiceJournalKinds.issue,
		lines: issueLines(debtorsAccountId, invoice.total, invoice.lines)
	});
	const columns = { status: InvoiceStatuses.issued, issued_journal_id: journalId };
	await moveInvoiceOrWithdraw(supabase, organisationId, invoice, { from: InvoiceStatuses.draft, columns, journalId });
	return invoice;
}
