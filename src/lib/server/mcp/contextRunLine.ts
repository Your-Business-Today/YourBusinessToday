import { contextRunActionName } from './actions/contextRunActions';
import { readActionToolName } from './actionToolNames';
import type { OrganisationMembership } from '$lib/data/organisationAccess';

/** For a person on an organisation: the one prompt starts with a context run of that organisation. */
export function contextRunLine(
	memberships: OrganisationMembership[],
	nameOf: (organisationId: string) => string
): string | null {
	if (memberships.length === 0) return null;
	const organisations = memberships.map(({ organisationId }) => `${nameOf(organisationId)} (${organisationId})`);
	return (
		`To run your company context, as the one prompt on the portal asks, call ${readActionToolName} with ` +
		`${contextRunActionName} and the organisationId of ${organisations.join(', ')} first, and follow what it answers.`
	);
}
