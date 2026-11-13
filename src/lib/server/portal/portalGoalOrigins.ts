import type { MapStage } from '$lib/data/workflowMap/workflowMap';
import type { PortalGoalOrigin } from '$lib/portal/portalProject';

type Row = Record<string, unknown>;

export const noGoalOrigin: PortalGoalOrigin = { workflowMap: null };

/** Where each goal came from, as the portal surface gives it: the confirmed workflow map it was raised from, if any. */
export function goalOriginsOf(goalRows: Row[]): Map<string, PortalGoalOrigin> {
	return new Map(goalRows.map((goalRow) => [String(goalRow.id), originOf(goalRow)]));
}

function originOf(goalRow: Row): PortalGoalOrigin {
	return { workflowMap: workflowMapOf(goalRow) };
}

function workflowMapOf(goalRow: Row): PortalGoalOrigin['workflowMap'] {
	const versionNumber = numberOrNull(goalRow.workflow_map_version_number);
	if (versionNumber === null) return null;
	return { stage: String(goalRow.workflow_map_stage) as MapStage, versionNumber };
}

function numberOrNull(value: unknown): number | null {
	return typeof value === 'number' ? value : null;
}
