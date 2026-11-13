import type { SupabaseClient } from '@supabase/supabase-js';
import { reversedLines } from '$lib/data/books/invoicePostings';
import type { JournalKind } from '$lib/data/books/journalKinds';
import type { MatchedBankLine } from './heldBankLine';
import { findJournalLines } from './journalLines';
import { prepareStepJournal, type StepJournal } from './journalStep';

/** What a reversal of a match says it is, and the kind of journal it posts as. */
export type MatchReversalHeading = { description: string; kind: JournalKind };

/**
 * The journal that undoes what a match posted: the lines of the journal the line is tied to on the other sides, dated
 * the line's day, so the books on any day read as they did before the match, naming the journal it reverses.
 */
export async function prepareMatchReversal(
	supabase: SupabaseClient,
	organisationId: string,
	line: MatchedBankLine,
	heading: MatchReversalHeading
): Promise<StepJournal> {
	const postedLines = await findJournalLines(supabase, organisationId, line.matchedJournalId);
	return prepareStepJournal(supabase, organisationId, {
		journalDate: line.date,
		description: heading.description,
		kind: heading.kind,
		reversesJournalId: line.matchedJournalId,
		lines: reversedLines(postedLines)
	});
}
