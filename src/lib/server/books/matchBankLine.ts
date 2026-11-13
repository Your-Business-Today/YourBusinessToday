import type { SupabaseClient } from '@supabase/supabase-js';
import { matchDirectionRefusal, validateMatchChoice } from '$lib/data/books/bankLineMatchRules';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { runBooksStep } from './booksStep';
import { bankLineKnownAs, findMatchedJournalId, findUnmatchedBankLine, type HeldBankLine } from './heldBankLine';
import { matchPreparations, type PreparedBankLineMatch } from './bankLineMatchSteps';

/** A statement line matched: the line, and the journal it is now tied to with what it was. */
export type BankLineMatch = PreparedBankLineMatch & { line: HeldBankLine };

/** Who matched the line, by their account. */
export type MatchedBy = { accountId: string };

/**
 * Matches one statement line to what it was, in one step of the database with whatever the match posts, so a line and
 * its entry never disagree: a payment on an invoice, a cost paid that day, money moving to or from another account, or
 * an entry already in the books. A line matched already, money moving the wrong way for the kind, or a value its
 * columns cannot hold, is refused by name before anything is written.
 */
export async function matchBankLine(
	supabase: SupabaseClient,
	organisationId: string,
	matchedBy: MatchedBy,
	fields: Record<string, unknown>
): Promise<BankLineMatch> {
	const choice = validateMatchChoice(fields);
	if (typeof choice === 'string') throw new BooksRefusal(choice);
	const line = await findUnmatchedBankLine(supabase, organisationId, fields.bankLineId);
	refuseWhen(matchDirectionRefusal(choice.field, line.amount));
	const prepared = await matchPreparations[choice.field](supabase, organisationId, line, choice.details);
	const isMatched = await runBooksStep(supabase, {
		name: prepared.stepName,
		inputs: { ...prepared.inputs, target_bank_line_id: line.id, matched_by: matchedBy.accountId },
		hasHappened: async () => (await findMatchedJournalId(supabase, organisationId, line.id)) === prepared.journalId,
		move: `the line ${bankLineKnownAs(line)} was matched as ${prepared.whatItWas}`,
		whereItStands: `list_bank_lines says where the line ${bankLineKnownAs(line)} stands`
	});
	if (isMatched) return { ...prepared, line };
	const changed = 'was matched, or what it was to be matched to changed, while the match was being made';
	throw new BooksRefusal(`The line ${bankLineKnownAs(line)} ${changed}; list_bank_lines and read_invoice say where they stand.`);
}
