import type { SupabaseClient } from '@supabase/supabase-js';
import { BooksRefusal } from './booksRefusal';
import { runBooksStep } from './booksStep';
import { bankLineKnownAs, findMatchedBankLine, findMatchedJournalId, type MatchedBankLine } from './heldBankLine';
import { unmatchPreparations, type PreparedBankLineUnmatch, type UnmatchedBy } from './bankLineUnmatchSteps';

/** A match taken off: the line as it was matched, and what was undone. */
export type BankLineUnmatch = PreparedBankLineUnmatch & { line: MatchedBankLine };

/**
 * Takes a wrong match off a statement line, in one step of the database with withdrawing what the match posted: a
 * payment is taken back off its invoice and a movement reversed, each by a journal on the line's day, a cost deleted
 * leaving its deletion record, and an entry already in the books left as it was. The line then reads unmatched and can
 * be matched again. A line never matched, or one whose match cannot be withdrawn, is refused by name before anything changes.
 */
export async function unmatchBankLine(
	supabase: SupabaseClient,
	organisationId: string,
	unmatchedBy: UnmatchedBy,
	bankLineId: unknown
): Promise<BankLineUnmatch> {
	const line = await findMatchedBankLine(supabase, organisationId, bankLineId);
	const prepared = await unmatchPreparations[line.matchedAs](supabase, organisationId, line, unmatchedBy);
	const tiedTo = { target_organisation_id: organisationId, target_bank_line_id: line.id, expected_journal_id: line.matchedJournalId };
	const isUnmatched = await runBooksStep(supabase, {
		name: prepared.stepName,
		inputs: { ...tiedTo, ...prepared.inputs },
		hasHappened: async () => (await findMatchedJournalId(supabase, organisationId, line.id)) !== line.matchedJournalId,
		move: `the match was taken off the line ${bankLineKnownAs(line)}`,
		whereItStands: `list_bank_lines says where the line ${bankLineKnownAs(line)} stands`
	});
	if (isUnmatched) return { ...prepared, line };
	const changed = 'was unmatched, or what it was matched to changed, while the match was being taken off';
	throw new BooksRefusal(`The line ${bankLineKnownAs(line)} ${changed}; list_bank_lines and read_invoice say where they stand.`);
}
