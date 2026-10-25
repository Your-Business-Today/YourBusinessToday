import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { deployWindowColumns, parseDeployWindow } from './deployWindowRecord';
import { deployWindowStarts, type DeployWindow, type DeployWindowHistory } from '$lib/data/deployWindow';

/** The project's latest run of either kind and its latest timed window; neither until the migration runs. */
export async function readDeployWindowHistory(supabase: SupabaseClient, projectId: string): Promise<DeployWindowHistory> {
	return {
		latest: await readLatestRun(supabase, projectId),
		lastTimed: await readLatestTimedWindow(supabase, projectId)
	};
}

/** The project's most recent timed window, or null when none has run; none until the migration runs. */
export async function readLatestTimedWindow(supabase: SupabaseClient, projectId: string): Promise<DeployWindow | null> {
	const { data, error } = await latestRunsQuery(supabase, projectId).eq('started_by', deployWindowStarts.window).maybeSingle();
	if (isSchemaNotYetMigrated(error)) return null;
	if (error) throw error;
	return data === null ? null : parseDeployWindow(data);
}

async function readLatestRun(supabase: SupabaseClient, projectId: string): Promise<DeployWindow | null> {
	const { data, error } = await latestRunsQuery(supabase, projectId).maybeSingle();
	if (isSchemaNotYetMigrated(error)) return null;
	if (error) throw error;
	return data === null ? null : parseDeployWindow(data);
}

function latestRunsQuery(supabase: SupabaseClient, projectId: string) {
	return supabase
		.from('project_deploy_windows')
		.select(deployWindowColumns)
		.eq('project_id', projectId)
		.order('ran_at', { ascending: false })
		.limit(1);
}
