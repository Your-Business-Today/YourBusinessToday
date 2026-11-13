import type { SupabaseClient } from '@supabase/supabase-js';
import { formatBritishDate } from '$lib/data/britishDate';
import { formatPoundsAndPence, fromPence, toPence } from '$lib/data/books/money';
import { BooksRefusal } from './booksRefusal';
import { bankLinesTable } from './bankLines';
import type { HeldBankLine } from './heldBankLine';

type JournalHeading = { id: string; journal_date: string; description: string };

const nothing = 0;

type JournalLineSides = { account_id: string; debit: number | string; credit: number | string };

/**
 * The description of the journal a line is to be matched to, once it is found to be in the organisation's books, to post
 * the line's amount to the line's account on the line's day, and to be matched by no other line; otherwise a refusal.
 */
export async function findMatchableJournalDescription(
	supabase: SupabaseClient,
	organisationId: string,
	line: HeldBankLine,
	journalId: string
): Promise<string> {
	const journal = await findJournalHeading(supabase, organisationId, journalId);
	if (journal === null) throw new BooksRefusal(`No journal ${journalId} is in this organisation's books; explain_account_balance lists the bank's entries.`);
	const postedPence = await penceOnAccount(supabase, organisationId, journalId, line.bankAccountId);
	const isTheLine = journal.journal_date === line.date && postedPence === toPence(line.amount);
	if (!isTheLine) throw new BooksRefusal(notTheLineRefusal(journal, postedPence, line));
	await refuseWhenMatchedElsewhere(supabase, organisationId, journalId);
	return journal.description;
}

async function findJournalHeading(supabase: SupabaseClient, organisationId: string, journalId: string): Promise<JournalHeading | null> {
	const { data, error } = await supabase
		.from('books_journals')
		.select('id, journal_date, description')
		.eq('organisation_id', organisationId)
		.eq('id', journalId);
	if (error !== null) throw error;
	const [journal] = (data ?? []) as unknown as JournalHeading[];
	return journal ?? null;
}

async function penceOnAccount(supabase: SupabaseClient, organisationId: string, journalId: string, accountId: string): Promise<number> {
	const { data, error } = await supabase
		.from('books_journal_lines')
		.select('account_id, debit, credit')
		.eq('organisation_id', organisationId)
		.eq('journal_id', journalId);
	if (error !== null) throw error;
	const onAccount = ((data ?? []) as unknown as JournalLineSides[]).filter((side) => side.account_id === accountId);
	return onAccount.reduce((total, side) => total + toPence(Number(side.debit)) - toPence(Number(side.credit)), nothing);
}

async function refuseWhenMatchedElsewhere(supabase: SupabaseClient, organisationId: string, journalId: string): Promise<void> {
	const { data, error } = await supabase.from(bankLinesTable).select('id').eq('organisation_id', organisationId).eq('matched_journal_id', journalId);
	if (error !== null) throw error;
	const [otherLine] = (data ?? []) as { id: string }[];
	if (otherLine === undefined) return;
	throw new BooksRefusal(`Journal ${journalId} is matched already, to bank line ${otherLine.id}; a journal is matched by one line.`);
}

function notTheLineRefusal(journal: JournalHeading, postedPence: number, line: HeldBankLine): string {
	const posted = formatPoundsAndPence(fromPence(postedPence));
	const opening = `Journal "${journal.description}" posts ${posted} to the statement's account on ${formatBritishDate(journal.journal_date)}`;
	return `${opening}, but the line is ${formatPoundsAndPence(line.amount)} on ${formatBritishDate(line.date)}; match it to the journal that is the line.`;
}
