import { readConfirmedMapVersions, type ConfirmedMapVersion } from './readConfirmedMapVersions';
import { readMapContents } from './readMapContents';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

/** The version a client confirmed last, whole, with its id so a goal raised from it can keep it. */
export type ConfirmedWorkflowMapReading = { confirmed: ConfirmedMapVersion; map: WorkflowMapVersion };

/**
 * An organisation's confirmed workflow map: the version, Before or After, its client confirmed last; none before
 * they confirm one. The map's tables are the server's alone: call this with the service key once the caller is let in.
 */
export async function readConfirmedWorkflowMap(
	supabase: SupabaseClient,
	organisationId: string
): Promise<ConfirmedWorkflowMapReading | null> {
	const [confirmed] = await readConfirmedMapVersions(supabase, organisationId);
	if (confirmed === undefined) return null;
	const { data, error } = await supabase
		.from('workflow_map_versions')
		.select('id, stage, version_number, recorded_at')
		.eq('id', confirmed.id)
		.single();
	if (error) throw error;
	const map = await readMapContents(supabase, data);
	return { confirmed, map };
}
