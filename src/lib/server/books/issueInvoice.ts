import type { SupabaseClient } from '@supabase/supabase-js';
import { issueRefusal } from '$lib/data/books/invoiceMoveRules';
import { issueLines } from '$lib/data/books/invoicePostings';
import { InvoiceJournalKinds } from '$lib/data/books/journalKinds';
import { SystemAccounts } from '$lib/data/books/systemAccounts';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { runBooksStep } from './booksStep';
import { findHeldInvoice, type HeldInvoice } from './heldInvoice';
import { invoiceMoveWords, invoiceTarget } from './invoiceSteps';
import { isJournalPosted, journalArgument, prepareStepJournal } from './journalStep';
import { findOrOpenSystemAccount } from './systemAccounts';

const issueStep = 'issue_books_invoice';

/**
 * Issues one of the organisation's draft invoices: the sale posts to the ledger on the day the invoice is dated, the
 * customer owing its total on trade debtors and each line credited to its income account, and the invoice is issued
 * with the journal that posted it, in one step of the database. A draft whose customer, date or lines changed meanwhile,
 * or that is no longer a draft, is refused and nothing is posted.
 */
export async function issueInvoice(supabase: SupabaseClient, organisationId: string, invoiceId: unknown): Promise<HeldInvoice> {
	const invoice = await findHeldInvoice(supabase, organisationId, invoiceId);
	refuseWhen(issueRefusal(invoice));
	const debtorsAccountId = await findOrOpenSystemAccount(supabase, organisationId, SystemAccounts.tradeDebtors);
	const journal = await prepareStepJournal(supabase, organisationId, {
		journalDate: invoice.issueDate,
		description: `Invoice ${invoice.printedNumber} to ${invoice.customerName}`,
		kind: InvoiceJournalKinds.issue,
		lines: issueLines(debtorsAccountId, invoice.total, invoice.lines)
	});
	const isIssued = await runBooksStep(supabase, {
		name: issueStep,
		inputs: { ...invoiceTarget(organisationId, invoice.id), ...expectedDraft(invoice), issue_journal: journalArgument(journal) },
		hasHappened: () => isJournalPosted(supabase, organisationId, journal.id),
		...invoiceMoveWords(invoice.printedNumber, 'issued')
	});
	if (isIssued) return invoice;
	const changed = `Invoice ${invoice.printedNumber} stopped being the draft that was read, its customer, date or lines changing, while it was being issued`;
	throw new BooksRefusal(`${changed}; read_invoice says where it stands.`);
}

function expectedDraft(invoice: HeldInvoice) {
	return {
		expected_customer_id: invoice.customerId,
		expected_issue_date: invoice.issueDate,
		expected_line_ids: invoice.lines.map((line) => line.id)
	};
}
