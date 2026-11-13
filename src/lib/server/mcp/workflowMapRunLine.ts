import { olderOnePromptOpening, onePromptOpening } from '$lib/onboarding/onboarding';
import { workflowMapRequest } from '$lib/data/personRequests';
import { workflowMapRunActionName } from './actions/workflowMapRunActionName';
import { readActionToolName } from './actionToolNames';
import type { OrganisationMembership } from '$lib/data/organisationAccess';

/**
 * For a person on an organisation: the one prompt, in either wording a person may hold, and "map the workflows"
 * both start with a workflow map run of that organisation.
 */
export function workflowMapRunLine(
	memberships: OrganisationMembership[],
	nameOf: (organisationId: string) => string
): string | null {
	if (memberships.length === 0) return null;
	const organisations = memberships.map(({ organisationId }) => `${nameOf(organisationId)} (${organisationId})`);
	const asked = `as the one prompt on the portal asks ("${onePromptOpening}", or "${olderOnePromptOpening}" as it was first worded), or as "${workflowMapRequest}" asks`;
	return (
		`To run your workflow map, ${asked}, call ${readActionToolName} with ` +
		`${workflowMapRunActionName} and the organisationId of ${organisations.join(', ')} first, and follow what it answers.`
	);
}
