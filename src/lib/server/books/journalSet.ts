import type { SupabaseClient } from '@supabase/supabase-js';
import { runBooksStep, type BooksStep } from './booksStep';
import { isJournalPosted, journalArgument, type StepJournal } from './journalStep';

/** A move of the books in words, and where to read how they stand when it cannot be told whether it happened. */
export type MoveWords = Pick<BooksStep, 'move' | 'whereItStands'>;

const journalSetStep = 'post_books_journal_set';

/**
 * Posts the journals, each with its lines, in one step of the database, in the order given: all of them or none. The
 * step answers true or raises, so there is no refusal to tell apart; when its answer is lost, the first journal's id is
 * looked for, since the step posts every journal or none of them, and nothing is ever taken back.
 */
export async function postJournalSet(supabase: SupabaseClient, organisationId: string, journals: StepJournal[], words: MoveWords): Promise<void> {
	const [firstJournal] = journals;
	await runBooksStep(supabase, {
		name: journalSetStep,
		inputs: { target_organisation_id: organisationId, journals: journals.map(journalArgument) },
		hasHappened: () => isJournalPosted(supabase, organisationId, firstJournal.id),
		...words
	});
}
