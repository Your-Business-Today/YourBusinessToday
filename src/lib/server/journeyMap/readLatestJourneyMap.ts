import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { JourneyMap } from '$lib/data/journeyMap/journeyMap';

/**
 * The latest version of a product's journey map, whole and in the shape it was filed: views by route, journeys by
 * role then name, each journey's steps in order. None before its first filing, or before migration 0211 has run.
 */
export async function readLatestJourneyMap(supabase: SupabaseClient, projectId: string): Promise<JourneyMap | null> {
	const { data, error } = await supabase.rpc('read_project_site_map_version', { target_project: projectId });
	if (isSchemaNotYetMigrated(error)) return null;
	if (error) throw error;
	if (data === null) return null;
	return data as JourneyMap;
}
