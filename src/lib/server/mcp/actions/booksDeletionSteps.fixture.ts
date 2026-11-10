import { ledgerTables } from './booksLedgerDatabase.fixture';

type Row = Record<string, unknown>;

const DeletableInvoiceStatuses = ['draft', 'void'];

let deletionCount = 0;

const deletionIdDigits = 12;

function rowsOf(table: string): Row[] {
	return ledgerTables[table] ?? [];
}

function takeOut(table: string, isGoing: (row: Row) => boolean): Row[] {
	const going = rowsOf(table).filter(isGoing);
	ledgerTables[table] = rowsOf(table).filter((row) => !going.includes(row));
	return going;
}

function byPosition(first: Row, second: Row): number {
	return Number(first.position) - Number(second.position);
}

function keepDeletion(args: Row, kind: string, record: Row, journals: Row[]): string {
	deletionCount += 1;
	const id = `00000000-0000-4000-9000-${String(deletionCount).padStart(deletionIdDigits, '0')}`;
	const deletion = { id, organisation_id: args.target_organisation_id, kind, record_id: record.id, record, journals };
	const knownAs = args.invoice_known_as ?? args.cost_known_as;
	ledgerTables.books_deletions = [...rowsOf('books_deletions'), { ...deletion, known_as: knownAs, deleted_by_account_id: args.deleting_account_id }];
	return id;
}

/** The invoice step as 0193 makes it: a draft or void invoice still as the server read it, with no payment, goes with its lines. */
export function deleteInvoiceKeepingRecord(args: Row): string | null {
	const invoice = rowsOf('books_invoices').find((held) => held.id === args.target_invoice_id);
	const isStillAsRead = invoice?.status === args.expected_status && DeletableInvoiceStatuses.includes(String(invoice?.status));
	const hasPayment = rowsOf('books_invoice_payments').some((payment) => payment.invoice_id === args.target_invoice_id);
	if (invoice === undefined || !isStillAsRead || hasPayment) return null;
	const lines = takeOut('books_invoice_lines', (line) => line.invoice_id === invoice.id).sort(byPosition);
	takeOut('books_invoices', (held) => held === invoice);
	return keepDeletion(args, 'invoice', { ...invoice, lines, customer_name: args.customer_label }, []);
}

/** The cost step as 0193 makes it: the cost goes with its recording and payment journals and their lines, as they are now. */
export function deleteCostKeepingRecord(args: Row): string | null {
	const cost = rowsOf('books_expenses').find((held) => held.id === args.target_expense_id);
	if (cost === undefined) return null;
	const journalIds: unknown[] = [cost.recorded_journal_id, cost.payment_journal_id].filter((journalId) => journalId !== null && journalId !== undefined);
	const lines = takeOut('books_journal_lines', (line) => journalIds.includes(line.journal_id)).sort(byPosition);
	const journals = takeOut('books_journals', (journal) => journalIds.includes(journal.id))
		.sort((first, second) => journalIds.indexOf(first.id) - journalIds.indexOf(second.id))
		.map((journal) => ({ ...journal, lines: lines.filter((line) => line.journal_id === journal.id) }));
	takeOut('books_expenses', (held) => held === cost);
	return keepDeletion(args, 'cost', { ...cost }, journals);
}
