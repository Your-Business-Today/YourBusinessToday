import { mapStageNames } from '$lib/data/workflowMap/workflowMapWords';
import { organisationWorkflowMapPath } from '$lib/data/workflowMap/workflowMapPaths';
import type { ConfirmedMapVersion } from '$lib/server/workflowMap/readConfirmedMapVersions';

/** A service goal's link back to the client's confirmed workflow map it was raised from. */
export function goalMapOriginLink({ organisationId, stage, versionNumber }: ConfirmedMapVersion): { href: string; label: string } {
	const version = `${mapStageNames[stage]} version ${versionNumber}`;
	return {
		href: organisationWorkflowMapPath(organisationId),
		label: `Raised from the client's confirmed workflow map, ${version}`
	};
}
