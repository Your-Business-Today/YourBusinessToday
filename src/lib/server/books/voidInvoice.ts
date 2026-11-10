import type { SupabaseClient } from '@supabase/supabase-js';
import { voidRefusal } from '$lib/data/books/invoiceMoveRules';
import { reversedLines } from '$lib/data/books/invoicePostings';
import { InvoiceStatuses } from '$lib/data/books/invoiceStatuses';
import { InvoiceJournalKinds } from '$lib/data/books/journalKinds';
import { ukClockAt } from '$lib/data/ukClock';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { runBooksStep } from './booksStep';
import { findHeldInvoice, type HeldInvoice } from './heldInvoice';
import { findInvoiceHeader } from './invoices';
import { invoiceMoveWords, invoiceTarget } from './invoiceSteps';
import { findIssuedJournalId } from './issuedJournal';
import { findJournalLines } from './journalLines';
import { isJournalPosted, journalArgument, prepareStepJournal, type StepJournal } from './journalStep';

/** The invoice voided, with the reversal it posted, or null when the invoice had posted nothing to reverse. */
export type VoidedInvoice = HeldInvoice & { reversalJournalId: string | null };

const voidStep = 'void_books_invoice';

/**
 * Voids one of the organisation's invoices in one step of the database. An issued one has its sale reversed rather than
 * removed: a journal dated today puts the lines it posted on the other sides, naming the journal it reverses. A draft
 * posted nothing, so it is marked void and nothing more. One with payments recorded against it is refused, as is one
 * that moved on, or took a payment, while it was being voided.
 */
export async function voidInvoice(supabase: SupabaseClient, organisationId: string, invoiceId: unknown): Promise<VoidedInvoice> {
	const invoice = await findHeldInvoice(supabase, organisationId, invoiceId);
	refuseWhen(voidRefusal(invoice));
	const reversal = await prepareReversal(supabase, organisationId, invoice);
	const isVoided = await runBooksStep(supabase, {
		name: voidStep,
		inputs: { ...invoiceTarget(organisationId, invoice.id), expected_status: invoice.status, reversal_journal: reversalArgument(reversal) },
		hasHappened: () => (reversal === null ? isVoid(supabase, organisationId, invoice) : isJournalPosted(supabase, organisationId, reversal.id)),
		...invoiceMoveWords(invoice.printedNumber, 'voided')
	});
	if (isVoided) return { ...invoice, reversalJournalId: reversal?.id ?? null };
	const stopped = `Invoice ${invoice.printedNumber} stopped being ${invoice.status}, or had a payment recorded, while it was being voided`;
	throw new BooksRefusal(`${stopped}; read_invoice says where it stands.`);
}

async function prepareReversal(supabase: SupabaseClient, organisationId: string, invoice: HeldInvoice): Promise<StepJournal | null> {
	const issuedJournalId = await findIssuedJournalId(supabase, organisationId, invoice.id);
	if (issuedJournalId === null) return null;
	const issuedLines = await findJournalLines(supabase, organisationId, issuedJournalId);
	return prepareStepJournal(supabase, organisationId, {
		journalDate: ukClockAt(new Date()).date,
		description: `Void of invoice ${invoice.printedNumber} to ${invoice.customerName}`,
		kind: InvoiceJournalKinds.void,
		reversesJournalId: issuedJournalId,
		lines: reversedLines(issuedLines)
	});
}

function reversalArgument(reversal: StepJournal | null) {
	if (reversal === null) return null;
	return journalArgument(reversal);
}

async function isVoid(supabase: SupabaseClient, organisationId: string, invoice: HeldInvoice): Promise<boolean> {
	const header = await findInvoiceHeader(supabase, organisationId, invoice.id);
	return header?.status === InvoiceStatuses.void;
}
