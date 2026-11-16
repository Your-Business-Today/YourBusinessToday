import type { OrganisationLink } from '$lib/server/onboarding/leadOrganisationRows';

/** The company's own organisation as read_client gives it, or how to open one. */
export function describeLeadOrganisation(organisation: OrganisationLink | null): string {
	if (organisation === null) return 'Organisation: none yet (open_lead_organisation opens one, inviting nobody)';
	return `Organisation: ${organisation.name} — id ${organisation.id}`;
}
