import { workflowMapRequest } from '$lib/data/personRequests';
import { workflowMapRunActionName } from './actions/workflowMapRunActionName';
import { readActionToolName } from './actionToolNames';
import type { OrganisationMembership } from '$lib/data/organisationAccess';

/** For a person on an organisation: mapping its workflows starts with a workflow map run of that organisation. */
export function workflowMapRunLine(
	memberships: OrganisationMembership[],
	nameOf: (organisationId: string) => string
): string | null {
	if (memberships.length === 0) return null;
	const organisations = memberships.map(({ organisationId }) => `${nameOf(organisationId)} (${organisationId})`);
	return (
		`To map an organisation's workflows, as "${workflowMapRequest}" asks, call ${readActionToolName} with ` +
		`${workflowMapRunActionName} and the organisationId of ${organisations.join(', ')}, and follow what it answers.`
	);
}
