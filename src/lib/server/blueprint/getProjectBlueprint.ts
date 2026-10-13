import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import type { ProjectBlueprint } from '$lib/data/blueprint/projectBlueprint';

/** The project's last reading of its product, or null when none has been read or its migration has not run; every column is read so the MCP map is simply missing until its own migration runs. */
export async function getProjectBlueprint(supabase: SupabaseClient, projectId: string): Promise<ProjectBlueprint | null> {
	const { data, error } = await supabase
		.from('project_blueprints')
		.select('*')
		.eq('project_id', projectId)
		.maybeSingle();
	if (isSchemaNotYetMigrated(error)) return null;
	if (error) throw error;
	if (data === null) return null;
	return {
		domain: data.domain,
		siteMap: data.site_map,
		mcpMap: data.mcp_map ?? null,
		readAtCommit: data.read_at_commit,
		readAt: data.read_at
	};
}
