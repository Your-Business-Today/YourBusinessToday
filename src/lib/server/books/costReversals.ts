import type { SupabaseClient } from '@supabase/supabase-js';
import { costJournalIds, reversedCostRefusal, type CostJournals, type CostReversal } from '$lib/data/books/costReversalRules';
import { refuseWhen } from './booksRefusal';

type ReversalRow = { id: string; journal_date: string; description: string; reverses_journal_id: string };

/** The journals that reverse the recording or the payment of a cost, the earliest first, leaving out the cost's own. */
export async function findCostReversals(supabase: SupabaseClient, organisationId: string, cost: CostJournals): Promise<CostReversal[]> {
	const journalIds = costJournalIds(cost);
	if (journalIds.length === 0) return [];
	const { data, error } = await supabase
		.from('books_journals')
		.select('id, journal_date, description, reverses_journal_id')
		.eq('organisation_id', organisationId)
		.in('reverses_journal_id', journalIds)
		.order('journal_date', { ascending: true });
	if (error !== null) throw error;
	const reversals = (data ?? []) as ReversalRow[];
	return reversals.filter((reversal) => !journalIds.includes(reversal.id)).map(fromReversalRow);
}

/** Refuses, naming each reversal, to delete a cost whose recording or payment another journal reverses. */
export async function refuseReversedCost(supabase: SupabaseClient, organisationId: string, cost: CostJournals): Promise<void> {
	const reversals = await findCostReversals(supabase, organisationId, cost);
	refuseWhen(reversedCostRefusal(cost, reversals));
}

function fromReversalRow(row: ReversalRow): CostReversal {
	return { journalId: row.id, journalDate: row.journal_date, description: row.description, reversedJournalId: row.reverses_journal_id };
}
