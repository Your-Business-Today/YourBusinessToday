import type { SupabaseClient } from '@supabase/supabase-js';
import { owedAfterTakeBack, takeBackRefusal } from '$lib/data/books/invoiceMoveRules';
import { InvoiceJournalKinds } from '$lib/data/books/journalKinds';
import { formatPoundsAndPence } from '$lib/data/books/money';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import type { MatchedBankLine } from './heldBankLine';
import type { PreparedBankLineUnmatch, UnmatchedBy } from './bankLineUnmatchSteps';
import { findHeldInvoice, type HeldInvoice } from './heldInvoice';
import { findPaymentPostedBy } from './invoicePayments';
import { findExpenseRecordedBy } from './expenses';
import { refuseReversedCost } from './costReversals';
import { journalArgument } from './journalStep';
import { prepareMatchReversal } from './matchReversal';

/**
 * A line matched as a payment on an invoice comes off with the payment taken back off the invoice: a journal reverses
 * its posting on the line's day, and the invoice owes the amount again, issued once more when the payment had settled it.
 */
export async function prepareInvoicePaymentUnmatch(
	supabase: SupabaseClient,
	organisationId: string,
	line: MatchedBankLine,
	unmatchedBy: UnmatchedBy
): Promise<PreparedBankLineUnmatch> {
	const payment = await findPaymentPostedBy(supabase, organisationId, line.matchedJournalId);
	if (payment === null) throw new BooksRefusal(`No payment on an invoice is posted by journal ${line.matchedJournalId} any more; read_invoice says where the invoice stands.`);
	const invoice = await findHeldInvoice(supabase, organisationId, payment.invoiceId);
	refuseWhen(takeBackRefusal(invoice));
	const reversal = await prepareMatchReversal(supabase, organisationId, line, {
		description: `Payment for invoice ${invoice.printedNumber} from ${invoice.customerName} taken back, matched to the wrong bank line`,
		kind: InvoiceJournalKinds.payment
	});
	return {
		stepName: 'unmatch_books_bank_line_invoice_payment',
		inputs: { reversal_journal: journalArgument(reversal), taken_back_by: unmatchedBy.accountId },
		whatWasUndone: describeTakeBack(invoice, payment.amount, reversal.id)
	};
}

/** A line matched as a cost comes off with the cost deleted as delete_expense deletes one, leaving its deletion record. */
export async function prepareCostUnmatch(
	supabase: SupabaseClient,
	organisationId: string,
	line: MatchedBankLine,
	unmatchedBy: UnmatchedBy
): Promise<PreparedBankLineUnmatch> {
	const cost = await findExpenseRecordedBy(supabase, organisationId, line.matchedJournalId);
	if (cost === null) throw new BooksRefusal(`No cost is recorded by journal ${line.matchedJournalId} any more; list_expenses lists the costs.`);
	await refuseReversedCost(supabase, organisationId, cost);
	const forWhat = cost.description === '' ? '' : ` for ${cost.description}`;
	return {
		stepName: 'unmatch_books_bank_line_cost',
		inputs: { target_expense_id: cost.id, cost_known_as: cost.supplier, deleting_account_id: unmatchedBy.accountId },
		whatWasUndone: `the cost from ${cost.supplier}${forWhat} was deleted with its journals, and list_books_deletions keeps the record`
	};
}

function describeTakeBack(invoice: HeldInvoice, amount: number, reversalJournalId: string): string {
	const owed = formatPoundsAndPence(owedAfterTakeBack(invoice, amount));
	const payment = `the payment of ${formatPoundsAndPence(amount)} on invoice ${invoice.printedNumber} from ${invoice.customerName}`;
	return `${payment} was taken back by journal ${reversalJournalId}, dated the line's day; the invoice is issued and owes ${owed} again`;
}
