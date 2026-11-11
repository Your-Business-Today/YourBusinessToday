import { toPence } from '$lib/data/books/money';
import { ledgerTables } from './booksLedgerDatabase.fixture';
import { journalDebitPence, postStepJournal, rowsOf } from './booksStepJournal.fixture';

type Row = Record<string, unknown>;

const costOf = (args: Row) => rowsOf('books_expenses').find((cost) => cost.id === args.target_expense_id);

function refuseUnlessPosts(journal: Row, amount: unknown): void {
	const postedPence = journalDebitPence(journal.id);
	const costPence = toPence(Number(amount));
	if (postedPence === costPence) return;
	throw { message: `Journal ${journal.id} posts another amount than the cost's ${amount}` };
}

/** 0198's recording step: the cost's journal with its lines, and the cost kept with it. */
export function recordCostStep(args: Row): boolean {
	const journal = args.recorded_journal as Row;
	postStepJournal(args.target_organisation_id, journal);
	refuseUnlessPosts(journal, args.amount);
	const { expense_date, supplier, description, amount, expense_account_id, cost_centre_id, paid_on } = args;
	const cost = { expense_date, supplier, description, amount, expense_account_id, cost_centre_id, paid_on };
	const kept = { id: args.new_expense_id, organisation_id: args.target_organisation_id, ...cost, recorded_journal_id: journal.id, payment_journal_id: null };
	ledgerTables.books_expenses = [...rowsOf('books_expenses'), kept];
	return true;
}

/** 0198's payment step: a cost still unpaid under its lock is paid with its journal; one gone or paid already is not. */
export function payCostStep(args: Row): boolean {
	const cost = costOf(args);
	if (cost === undefined || (cost.paid_on ?? null) !== null) return false;
	const journal = args.payment_journal as Row;
	postStepJournal(args.target_organisation_id, journal);
	refuseUnlessPosts(journal, cost.amount);
	Object.assign(cost, { paid_on: args.payment_paid_on, payment_journal_id: journal.id });
	return true;
}

/** 0198's set step: every journal with its lines, in the order given. */
export function postJournalSetStep(args: Row): boolean {
	for (const journal of args.journals as Row[]) postStepJournal(args.target_organisation_id, journal);
	return true;
}
