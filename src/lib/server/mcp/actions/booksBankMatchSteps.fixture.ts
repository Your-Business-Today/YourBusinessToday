import { toPence } from '$lib/data/books/money';
import { recordCostStep } from './booksCostSteps.fixture';
import { recordPaymentStep } from './booksInvoiceSteps.fixture';
import { postStepJournal, rowsOf, totalOf } from './booksStepJournal.fixture';

type Row = Record<string, unknown>;

const lineOf = (args: Row) => rowsOf('books_bank_lines').find((line) => line.id === args.target_bank_line_id);
const isUnmatched = (line: Row | undefined) => line !== undefined && (line.matched_journal_id ?? null) === null;
const journalIdOf = (journal: unknown) => (journal as Row).id;

function pencePostedTo(journalId: unknown, accountId: unknown): number {
	const sides = rowsOf('books_journal_lines').filter((side) => side.journal_id === journalId && side.account_id === accountId);
	return totalOf(sides, 'debit') - totalOf(sides, 'credit');
}

/** 0223's tie step: an unmatched line is tied to a journal no other line holds, which posts its amount on its day. */
export function tieBankLineStep(args: Row): boolean {
	const line = lineOf(args);
	if (!isUnmatched(line)) return false;
	const isHeldElsewhere = rowsOf('books_bank_lines').some((other) => other.matched_journal_id === args.target_journal_id);
	if (isHeldElsewhere) return false;
	const journal = rowsOf('books_journals').find((candidate) => candidate.id === args.target_journal_id);
	const isTheLine = journal?.journal_date === line?.line_date && pencePostedTo(args.target_journal_id, line?.bank_account_id) === toPence(Number(line?.amount));
	if (!isTheLine) throw { message: `Journal ${args.target_journal_id} does not post the line` };
	const match = { matched_journal_id: args.target_journal_id, matched_as: args.match_kind, matched_at: '2026-11-13T21:00:00Z', matched_by_account_id: args.matched_by };
	Object.assign(line as Row, match);
	return true;
}

function tieOrRaise(args: Row, journalId: unknown, kind: string): boolean {
	if (tieBankLineStep({ ...args, target_journal_id: journalId, match_kind: kind })) return true;
	throw { message: `Bank line ${args.target_bank_line_id} could not be tied` };
}

/** 0223's invoice step: the line held first, then 0219's payment, then the tie. */
export function matchAsInvoicePaymentStep(args: Row): boolean {
	if (!isUnmatched(lineOf(args)) || !recordPaymentStep(args)) return false;
	return tieOrRaise(args, journalIdOf(args.payment_journal), 'invoice_payment');
}

/** 0223's cost step: the line held first, then 0198's recording, then the tie. */
export function matchAsCostStep(args: Row): boolean {
	if (!isUnmatched(lineOf(args))) return false;
	recordCostStep(args);
	return tieOrRaise(args, journalIdOf(args.recorded_journal), 'cost');
}

/** 0223's account step: the line held first, then the movement's journal, then the tie. */
export function matchToAccountStep(args: Row): boolean {
	if (!isUnmatched(lineOf(args))) return false;
	postStepJournal(args.target_organisation_id, args.account_journal as Row);
	return tieOrRaise(args, journalIdOf(args.account_journal), 'account');
}
