import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import type { MapConfirmation } from '$lib/data/workflowMap/mapConfirmed';
import type { MapStage } from '$lib/data/workflowMap/workflowMap';
import type { SupabaseClient } from '@supabase/supabase-js';

/** A version a client confirmed: whose it is, which stage and number, and when, as a goal raised from it names it. */
export type ConfirmedMapVersion = MapConfirmation & { id: string; organisationId: string };

const confirmedColumns = 'version_id, confirmed_at, workflow_map_versions!inner(organisation_id, stage, version_number)';

/** Every version of an organisation's maps its client confirmed, latest confirmation first; none before migration 0213. */
export async function readConfirmedMapVersions(supabase: SupabaseClient, organisationId: string): Promise<ConfirmedMapVersion[]> {
	const { data, error } = await supabase
		.from('workflow_map_confirmations')
		.select(confirmedColumns)
		.eq('workflow_map_versions.organisation_id', organisationId)
		.order('confirmed_at', { ascending: false });
	if (isSchemaNotYetMigrated(error)) return [];
	if (error) throw error;
	return data.map(toConfirmedVersion);
}

/** The version with this id when its client confirmed it; none when there is no such version or it is not confirmed. */
export async function findConfirmedMapVersion(supabase: SupabaseClient, versionId: string): Promise<ConfirmedMapVersion | null> {
	const { data, error } = await supabase
		.from('workflow_map_confirmations')
		.select(confirmedColumns)
		.eq('version_id', versionId)
		.maybeSingle();
	if (isSchemaNotYetMigrated(error)) return null;
	if (error) throw error;
	return data === null ? null : toConfirmedVersion(data);
}

function toConfirmedVersion(row: Record<string, unknown>): ConfirmedMapVersion {
	const version = row.workflow_map_versions as Record<string, unknown>;
	return {
		id: String(row.version_id),
		organisationId: String(version.organisation_id),
		stage: String(version.stage) as MapStage,
		versionNumber: Number(version.version_number),
		confirmedAt: String(row.confirmed_at)
	};
}
