import type { SupabaseClient } from '@supabase/supabase-js';
import { BankLineMatchKinds } from '$lib/data/books/bankLineMatchRules';
import { manualJournalKind } from '$lib/data/books/journalKinds';
import { BooksRefusal } from './booksRefusal';
import type { MatchedBankLine } from './heldBankLine';
import type { PreparedBankLineUnmatch } from './bankLineUnmatchSteps';
import { journalArgument } from './journalStep';
import { findMatchedJournalDescriptions } from './matchedJournals';
import { prepareMatchReversal } from './matchReversal';

type ReversalRow = { id: string };

/**
 * A line matched as money moving to or from another account comes off with its journal reversed by one of its own,
 * dated the line's day. A journal something has reversed already is refused, so nothing is reversed twice.
 */
export async function prepareAccountUnmatch(supabase: SupabaseClient, organisationId: string, line: MatchedBankLine): Promise<PreparedBankLineUnmatch> {
	const description = await findTiedJournalDescription(supabase, organisationId, line);
	await refuseWhenReversedAlready(supabase, organisationId, line, description);
	const reversal = await prepareMatchReversal(supabase, organisationId, line, {
		description: `Reversal of "${description}", matched to the wrong bank line`,
		kind: manualJournalKind
	});
	return {
		stepName: 'unmatch_books_bank_line_account',
		inputs: { reversal_journal: journalArgument(reversal) },
		whatWasUndone: `the journal "${description}" was reversed by journal ${reversal.id}, dated the line's day`
	};
}

/** A line tied to an entry already in the books only comes untied: the entry was there before the match and stays. */
export async function prepareExistingJournalUnmatch(
	supabase: SupabaseClient,
	organisationId: string,
	line: MatchedBankLine
): Promise<PreparedBankLineUnmatch> {
	const description = await findTiedJournalDescription(supabase, organisationId, line);
	return {
		stepName: 'untie_books_bank_line',
		inputs: { expected_kind: BankLineMatchKinds.existingJournal },
		whatWasUndone: `the entry "${description}" was in the books before the match and stays as it was`
	};
}

async function findTiedJournalDescription(supabase: SupabaseClient, organisationId: string, line: MatchedBankLine): Promise<string> {
	const descriptions = await findMatchedJournalDescriptions(supabase, organisationId, [line]);
	return descriptions.get(line.matchedJournalId) ?? `journal ${line.matchedJournalId}`;
}

async function refuseWhenReversedAlready(supabase: SupabaseClient, organisationId: string, line: MatchedBankLine, description: string): Promise<void> {
	const { data, error } = await supabase
		.from('books_journals')
		.select('id')
		.eq('organisation_id', organisationId)
		.in('reverses_journal_id', [line.matchedJournalId]);
	if (error !== null) throw error;
	const [reversal] = (data ?? []) as ReversalRow[];
	if (reversal === undefined) return;
	throw new BooksRefusal(`The journal "${description}" is reversed already, by journal ${reversal.id}; taking the match off would reverse it twice.`);
}
