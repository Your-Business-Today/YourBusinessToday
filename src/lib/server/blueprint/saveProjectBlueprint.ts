import type { SupabaseClient } from '@supabase/supabase-js';
import type { ProjectBlueprint } from '$lib/data/blueprint/projectBlueprint';

/** Keeps the reading as the project's one blueprint, replacing the one before it. */
export async function saveProjectBlueprint(
	supabase: SupabaseClient,
	projectId: string,
	blueprint: ProjectBlueprint
): Promise<void> {
	const { error } = await supabase.from('project_blueprints').upsert(
		{
			project_id: projectId,
			domain: blueprint.domain,
			site_map: blueprint.siteMap,
			mcp_map: blueprint.mcpMap,
			read_at_commit: blueprint.readAtCommit,
			read_at: blueprint.readAt
		},
		{ onConflict: 'project_id' }
	);
	if (error) throw error;
}
