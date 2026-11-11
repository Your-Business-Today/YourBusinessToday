import { toPence } from '$lib/data/books/money';
import { ledgerTables } from './booksLedgerDatabase.fixture';

type Row = Record<string, unknown>;

let stepLineCount = 0;
let journalsInStep = 0;

/**
 * Which journal of the next step the database refuses part-way, counting from one, as a line on an account it no longer
 * holds would be; the step then fails and, being one transaction, leaves nothing behind. Null for none.
 */
export const journalRefusal: { atJournal: number | null } = { atJournal: null };

export const rowsOf = (table: string): Row[] => ledgerTables[table] ?? [];

export const totalOf = (rows: Row[], column: string) => rows.reduce((total, row) => total + toPence(Number(row[column] ?? 0)), 0);

/** A new step starts counting its journals from the first. */
export function beginStep(): void {
	journalsInStep = 0;
}

/** 0195's post_books_journal_in_step: the journal and its lines whole, or a raised refusal when they do not balance. */
export function postStepJournal(organisationId: unknown, journal: Row): void {
	journalsInStep += 1;
	if (journalsInStep === journalRefusal.atJournal) throw { message: `Journal ${journal.id} names an account the books no longer hold` };
	const lines = journal.lines as Row[];
	if (totalOf(lines, 'debit') !== totalOf(lines, 'credit')) throw { message: `Journal ${journal.id} does not balance` };
	const { id, journal_date, description, kind, reverses_journal_id } = journal;
	const journalRow = { id, organisation_id: organisationId, journal_date, description, kind, reverses_journal_id };
	ledgerTables.books_journals = [...rowsOf('books_journals'), journalRow];
	const lineRows = lines.map((line, position) => ({ id: `step-line-${(stepLineCount += 1)}`, journal_id: id, ...line, position }));
	ledgerTables.books_journal_lines = [...rowsOf('books_journal_lines'), ...lineRows];
}

/** What a posted journal debits in all, in pence. */
export function journalDebitPence(journalId: unknown): number {
	return totalOf(rowsOf('books_journal_lines').filter((line) => line.journal_id === journalId), 'debit');
}
