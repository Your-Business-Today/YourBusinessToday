import { mapStageNames } from '$lib/data/workflowMap/workflowMapWords';
import { portalContextPath, portalWorkflowMapPath } from '$lib/portal/portalPaths';
import type { PortalGoalOrigin } from '$lib/portal/portalProject';

/** Where a goal came from, as a link back to it: the confirmed workflow map first, else the confirmed company context. */
export type GoalOriginLink = { href: string; label: string };

export function goalOriginLink({ workflowMap, contextVersionNumber }: PortalGoalOrigin): GoalOriginLink | null {
	if (workflowMap !== null) {
		const version = `${mapStageNames[workflowMap.stage]} version ${workflowMap.versionNumber}`;
		return { href: portalWorkflowMapPath, label: `From your confirmed workflow map, ${version}` };
	}
	if (contextVersionNumber === null) return null;
	return { href: portalContextPath, label: `From your confirmed company context, version ${contextVersionNumber}` };
}
