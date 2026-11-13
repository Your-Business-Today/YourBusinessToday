import { InvoiceStatuses } from '$lib/data/books/invoiceStatuses';
import { toPence } from '$lib/data/books/money';
import { ledgerTables } from './booksLedgerDatabase.fixture';
import { deleteCostKeepingRecord } from './booksDeletionSteps.fixture';
import { journalDebitPence, postStepJournal, rowsOf } from './booksStepJournal.fixture';

type Row = Record<string, unknown>;

const takenBackAt = '2026-11-13T21:30:00Z';
const lineOf = (args: Row) => rowsOf('books_bank_lines').find((line) => line.id === args.target_bank_line_id);
const isReversed = (journalId: unknown) => rowsOf('books_journals').some((journal) => journal.reverses_journal_id === journalId);
const reversesTheMatch = (args: Row, journal: Row) => journal.reverses_journal_id === args.expected_journal_id;

function isMatchedTo(args: Row, kind: unknown): boolean {
	const line = lineOf(args);
	return line !== undefined && line.matched_journal_id === args.expected_journal_id && line.matched_as === kind;
}

function untie(args: Row): true {
	Object.assign(lineOf(args) as Row, { matched_journal_id: null, matched_as: null, matched_at: null, matched_by_account_id: null });
	return true;
}

/** 0227's untie step: a line still matched to the journal read, as the kind read, is untied. */
export function untieBankLineStep(args: Row): boolean {
	return isMatchedTo(args, args.expected_kind) && untie(args);
}

/** 0227's take back step: the payment the journal posted is reversed, kept as taken back, and off its invoice. */
export function takeBackPaymentStep(args: Row): boolean {
	const payment = rowsOf('books_invoice_payments').find((held) => held.journal_id === args.target_payment_journal_id);
	const invoice = rowsOf('books_invoices').find((held) => held.id === payment?.invoice_id);
	const isPosted = invoice?.status === InvoiceStatuses.issued || invoice?.status === InvoiceStatuses.paid;
	const reversal = args.reversal_journal as Row;
	if (payment === undefined || !isPosted || reversal.reverses_journal_id !== args.target_payment_journal_id) return false;
	postStepJournal(args.target_organisation_id, reversal);
	const reversedPence = journalDebitPence(reversal.id);
	const paymentPence = toPence(Number(payment.amount));
	if (reversedPence !== paymentPence) throw { message: `Journal ${reversal.id} does not reverse the payment` };
	const takeBack = { invoice_id: payment.invoice_id, payment_id: payment.id, paid_on: payment.paid_on, amount: payment.amount };
	const kept = { ...takeBack, payment_journal_id: payment.journal_id, reversal_journal_id: reversal.id, taken_back_at: takenBackAt };
	ledgerTables.books_invoice_payment_takebacks = [...rowsOf('books_invoice_payment_takebacks'), { id: `takeback-of-${payment.id}`, ...kept }];
	ledgerTables.books_invoice_payments = rowsOf('books_invoice_payments').filter((held) => held !== payment);
	if (invoice?.status === InvoiceStatuses.paid) invoice.status = InvoiceStatuses.issued;
	return true;
}

/** 0227's invoice payment step: the line held, the payment taken back, then the line untied. */
export function unmatchInvoicePaymentStep(args: Row): boolean {
	if (!isMatchedTo(args, 'invoice_payment')) return false;
	return takeBackPaymentStep({ ...args, target_payment_journal_id: args.expected_journal_id }) && untie(args);
}

/** 0227's cost step: the line held, the cost recorded by its journal deleted as 0196 deletes it, then the line untied. */
export function unmatchCostStep(args: Row): boolean {
	const cost = rowsOf('books_expenses').find((held) => held.id === args.target_expense_id && held.recorded_journal_id === args.expected_journal_id);
	if (!isMatchedTo(args, 'cost') || cost === undefined) return false;
	return deleteCostKeepingRecord(args) !== null && untie(args);
}

/** 0227's account step: the line held, its journal reversed unless something reversed it already, then the line untied. */
export function unmatchAccountStep(args: Row): boolean {
	const reversal = args.reversal_journal as Row;
	if (!isMatchedTo(args, 'account') || isReversed(args.expected_journal_id) || !reversesTheMatch(args, reversal)) return false;
	postStepJournal(args.target_organisation_id, reversal);
	return untie(args);
}
