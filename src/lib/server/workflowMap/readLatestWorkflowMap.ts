import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { readMapContents } from './readMapContents';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { MapStage, WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

const versionColumns = 'id, stage, version_number, recorded_at';

/** The latest filed version of an organisation's Before or After map, whole; none before its first filing or 0210. */
export async function readLatestWorkflowMap(
	supabase: SupabaseClient,
	organisationId: string,
	stage: MapStage
): Promise<WorkflowMapVersion | null> {
	const { data, error } = await supabase
		.from('workflow_map_versions')
		.select(versionColumns)
		.eq('organisation_id', organisationId)
		.eq('stage', stage)
		.order('version_number', { ascending: false })
		.limit(1)
		.maybeSingle();
	if (isSchemaNotYetMigrated(error)) return null;
	if (error) throw error;
	if (data === null) return null;
	return readMapContents(supabase, data);
}
