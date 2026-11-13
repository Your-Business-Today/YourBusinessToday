import type { SupabaseClient } from '@supabase/supabase-js';
import type { WorkflowMapDraft } from '$lib/data/workflowMap/workflowMap';

export type MapFiling = { organisationId: string; recordedBy: string; draft: WorkflowMapDraft };

/** Files the next numbered version of an organisation's Before or After map, whole, and says which number it took. */
export async function fileWorkflowMap(supabase: SupabaseClient, filing: MapFiling): Promise<number> {
	const { data, error } = await supabase.rpc('file_workflow_map', {
		target_organisation: filing.organisationId,
		recorder: filing.recordedBy,
		map: filing.draft
	});
	if (error) throw error;
	return Number(data);
}
