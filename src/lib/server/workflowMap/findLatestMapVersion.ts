import type { MapStage } from '$lib/data/workflowMap/workflowMap';
import type { Refusal } from '$lib/server/portal/portalFormReading';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The latest filed version of one stage, by its id and number: the only version of that stage a client marks or confirms. */
export type LatestMapVersion = { id: string; versionNumber: number };

export async function findLatestMapVersion(
	service: SupabaseClient,
	organisationId: string,
	stage: MapStage
): Promise<LatestMapVersion | null> {
	const { data, error } = await service
		.from('workflow_map_versions')
		.select('id, version_number')
		.eq('organisation_id', organisationId)
		.eq('stage', stage)
		.order('version_number', { ascending: false })
		.limit(1)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return { id: String(data.id), versionNumber: Number(data.version_number) };
}

export function newerVersionFiled(versionNumber: number): Refusal {
	return { refusal: `Version ${versionNumber} has been filed since you opened the map: reload it and check that version.` };
}
