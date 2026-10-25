import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { parseProjectRecord, type Project } from '$lib/server/projects/projectRecord';

/** Every project with a repository and a deploy time set; none until the migration runs. */
export async function findProjectsWithDeployWindow(supabase: SupabaseClient): Promise<Project[]> {
	const { data, error } = await supabase
		.from('projects')
		.select('*')
		.neq('repository_url', '')
		.not('deploy_staging_at', 'is', null);
	if (isSchemaNotYetMigrated(error)) return [];
	if (error) throw error;
	return data.map(parseProjectRecord);
}
