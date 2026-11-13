import { InvoiceStatuses } from '$lib/data/books/invoiceStatuses';
import { toPence } from '$lib/data/books/money';
import { ledgerTables } from './booksLedgerDatabase.fixture';
import { postStepJournal, rowsOf, totalOf } from './booksStepJournal.fixture';

type Row = Record<string, unknown>;

const invoiceOf = (args: Row) => rowsOf('books_invoices').find((invoice) => invoice.id === args.target_invoice_id);
const ofInvoice = (table: string, args: Row) => rowsOf(table).filter((row) => row.invoice_id === args.target_invoice_id);
const postJournalOf = (args: Row, journal: Row) => postStepJournal(args.target_organisation_id, journal);

const sortedIds = (ids: unknown[]) => JSON.stringify(ids.map(String).sort());

/** 0195's issue step: a draft still with the customer, date and lines the server read is issued with its journal. */
export function issueInvoiceStep(args: Row): boolean {
	const invoice = invoiceOf(args);
	const isAsRead = invoice?.status === InvoiceStatuses.draft && invoice.customer_id === args.expected_customer_id && invoice.issue_date === args.expected_issue_date;
	const lineIds = ofInvoice('books_invoice_lines', args).map((line) => line.id);
	if (!isAsRead || sortedIds(lineIds) !== sortedIds(args.expected_line_ids as unknown[])) return false;
	const journal = args.issue_journal as Row;
	postJournalOf(args, journal);
	Object.assign(invoice, { status: InvoiceStatuses.issued, issued_journal_id: journal.id });
	return true;
}

/** 0195's void step: an invoice still in the status read, with no payment, is voided with the reversal of its sale. */
export function voidInvoiceStep(args: Row): boolean {
	const invoice = invoiceOf(args);
	const reversal = args.reversal_journal as Row | null;
	if (invoice === undefined) return false;
	const isAsRead = invoice.status === args.expected_status && invoice.status !== InvoiceStatuses.void && ofInvoice('books_invoice_payments', args).length === 0;
	if (!isAsRead || (reversal?.reverses_journal_id ?? null) !== (invoice.issued_journal_id ?? null)) return false;
	if (reversal !== null) postJournalOf(args, reversal);
	invoice.status = InvoiceStatuses.void;
	return true;
}

const tradeDebtorsCode = '1100';

const isOnTradeDebtors = (line: Row) => rowsOf('books_ledger_accounts').some((account) => account.id === line.account_id && account.code === tradeDebtorsCode);

/** 0219's payment step: what is owed is worked out under the lock from the issue journal's debit on trade debtors, less what was paid. */
export function recordPaymentStep(args: Row): boolean {
	const invoice = invoiceOf(args);
	if (invoice?.status !== InvoiceStatuses.issued) return false;
	const issueLines = rowsOf('books_journal_lines').filter((line) => line.journal_id === invoice.issued_journal_id && isOnTradeDebtors(line));
	const owedPence = totalOf(issueLines, 'debit') - totalOf(ofInvoice('books_invoice_payments', args), 'amount');
	const amountPence = toPence(Number(args.payment_amount));
	if (amountPence > owedPence) return false;
	const journal = args.payment_journal as Row;
	postJournalOf(args, journal);
	const payment = { id: `payment-of-${journal.id}`, invoice_id: invoice.id, paid_on: args.payment_paid_on, amount: args.payment_amount, journal_id: journal.id };
	ledgerTables.books_invoice_payments = [...rowsOf('books_invoice_payments'), payment];
	if (amountPence === owedPence) invoice.status = InvoiceStatuses.paid;
	return true;
}

/** 0195's lines step: a draft's lines are all swapped for the new ones together, or nothing changes. */
export function replaceLinesStep(args: Row): boolean {
	const invoice = invoiceOf(args);
	if (invoice?.status !== InvoiceStatuses.draft) return false;
	const kept = rowsOf('books_invoice_lines').filter((line) => line.invoice_id !== args.target_invoice_id);
	ledgerTables.books_invoice_lines = [...kept, ...(args.new_lines as Row[])];
	return true;
}
