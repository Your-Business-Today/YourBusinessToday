import type { ItemStanding } from '$lib/brand/library/choosableItem';
import type { PostingFooting } from '$lib/brand/library/libraryItem';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The brand's item with that id as it stands now, whether or not its file has arrived, or null when the brand holds none. */
export async function findItemStanding(supabase: SupabaseClient, organisationId: string, itemId: string): Promise<ItemStanding | null> {
	const { data, error } = await supabase
		.from('brand_library_items')
		.select('filename, posting, recorded_at')
		.eq('organisation_id', organisationId)
		.eq('id', itemId)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return { filename: data.filename as string, posting: data.posting as PostingFooting, recordedAt: (data.recorded_at as string | null) ?? null };
}
