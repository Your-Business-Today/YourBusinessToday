import type { ItemStanding } from '$lib/brand/library/choosableItem';
import type { PostingFooting } from '$lib/brand/library/libraryItem';
import type { SupabaseClient } from '@supabase/supabase-js';

/** A library item as a piece names it: how it stands, and what it shows. */
export type NamedItem = ItemStanding & { shows: string };

/** The brand's items of those ids as they stand now, by id; an id the brand does not hold is left out. */
export async function findItemStandings(supabase: SupabaseClient, organisationId: string, itemIds: string[]): Promise<Map<string, NamedItem>> {
	if (itemIds.length === 0) return new Map();
	const { data, error } = await supabase
		.from('brand_library_items')
		.select('id, filename, mime_type, posting, recorded_at, shows')
		.eq('organisation_id', organisationId)
		.in('id', itemIds);
	if (error) throw error;
	return new Map((data ?? []).map((row) => [row.id as string, namedItemOf(row)]));
}

function namedItemOf(row: Record<string, unknown>): NamedItem {
	return {
		filename: row.filename as string,
		mimeType: row.mime_type as string,
		posting: row.posting as PostingFooting,
		recordedAt: (row.recorded_at as string | null) ?? null,
		shows: row.shows as string
	};
}
