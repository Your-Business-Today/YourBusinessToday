import type { SupabaseClient } from '@supabase/supabase-js';
import type { BankLine } from './bankLines';

type JournalDescriptionRow = { id: string; description: string };

/** What each journal the lines are matched to is called, by the journal's id; empty when no line is matched. */
export async function findMatchedJournalDescriptions(supabase: SupabaseClient, organisationId: string, lines: BankLine[]): Promise<Map<string, string>> {
	const journalIds = lines.flatMap((line) => (line.matchedJournalId === null ? [] : [line.matchedJournalId]));
	if (journalIds.length === 0) return new Map();
	const { data, error } = await supabase.from('books_journals').select('id, description').eq('organisation_id', organisationId).in('id', journalIds);
	if (error !== null) throw error;
	const rows = (data ?? []) as unknown as JournalDescriptionRow[];
	return new Map(rows.map((row) => [row.id, row.description]));
}
