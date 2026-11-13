import type { SupabaseClient } from '@supabase/supabase-js';
import type { JourneyMapDraft } from '$lib/data/journeyMap/journeyMap';

/** Who files which product's journey map, and the whole version they file. */
export type JourneyMapFiling = {
	projectId: string;
	filedBy: string;
	draft: JourneyMapDraft;
};

/** Files the next numbered version of a product's journey map, whole, in one transaction, and says which number it took. */
export async function fileJourneyMap(supabase: SupabaseClient, filing: JourneyMapFiling): Promise<number> {
	const { data, error } = await supabase.rpc('file_project_site_map', {
		target_project: filing.projectId,
		filer: filing.filedBy,
		site_map: filing.draft
	});
	if (error) throw error;
	return Number(data);
}
