import { mapStage, type WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';
import { readLatestWorkflowMap } from './readLatestWorkflowMap';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The map of the business as it works today: its latest After, or its latest Before while no After is filed. */
export async function readTodaysWorkflowMap(supabase: SupabaseClient, organisationId: string): Promise<WorkflowMapVersion | null> {
	const after = await readLatestWorkflowMap(supabase, organisationId, mapStage.after);
	if (after !== null) return after;
	return readLatestWorkflowMap(supabase, organisationId, mapStage.before);
}
