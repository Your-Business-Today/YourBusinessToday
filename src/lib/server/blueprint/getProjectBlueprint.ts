import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import type { ProjectBlueprint } from '$lib/data/blueprint/projectBlueprint';

/** The project's last reading of its domain and site map, or null when none has been read or its migration has not run. */
export async function getProjectBlueprint(supabase: SupabaseClient, projectId: string): Promise<ProjectBlueprint | null> {
	const { data, error } = await supabase
		.from('project_blueprints')
		.select('domain, site_map, read_at_commit, read_at')
		.eq('project_id', projectId)
		.maybeSingle();
	if (isSchemaNotYetMigrated(error)) return null;
	if (error) throw error;
	if (data === null) return null;
	return { domain: data.domain, siteMap: data.site_map, readAtCommit: data.read_at_commit, readAt: data.read_at };
}
