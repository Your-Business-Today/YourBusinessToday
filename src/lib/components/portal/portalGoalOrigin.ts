import { mapStageNames } from '$lib/data/workflowMap/workflowMapWords';
import { portalWorkflowMapPath } from '$lib/portal/portalPaths';
import type { PortalGoalOrigin } from '$lib/portal/portalProject';

/** Where a goal came from, as a link back to the confirmed workflow map it was raised from. */
export type GoalOriginLink = { href: string; label: string };

export function goalOriginLink({ workflowMap }: PortalGoalOrigin): GoalOriginLink | null {
	if (workflowMap === null) return null;
	const version = `${mapStageNames[workflowMap.stage]} version ${workflowMap.versionNumber}`;
	return { href: portalWorkflowMapPath, label: `From your confirmed workflow map, ${version}` };
}
