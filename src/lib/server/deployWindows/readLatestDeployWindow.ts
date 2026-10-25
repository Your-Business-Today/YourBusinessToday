import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { deployWindowColumns, parseDeployWindow } from './deployWindowRecord';
import type { DeployWindow } from '$lib/data/deployWindow';

/** The project's most recent deploy window, or null when none has run; none until the migration runs. */
export async function readLatestDeployWindow(supabase: SupabaseClient, projectId: string): Promise<DeployWindow | null> {
	const { data, error } = await supabase
		.from('project_deploy_windows')
		.select(deployWindowColumns)
		.eq('project_id', projectId)
		.order('window_date', { ascending: false })
		.limit(1)
		.maybeSingle();
	if (isSchemaNotYetMigrated(error)) return null;
	if (error) throw error;
	return data === null ? null : parseDeployWindow(data);
}
