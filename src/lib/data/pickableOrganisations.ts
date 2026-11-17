/**
 * The organisations a picker offers: every one, less any opened for a company still on the Leads register. The one
 * a record already sits in is kept, so a form never quietly moves the record out of it.
 */
export function leaveOutLeadOrganisations<Choice extends { id: string }>(
	organisations: Choice[],
	leadOrganisationIds: Set<string>,
	keptOrganisationId: string | null = null
): Choice[] {
	return organisations.filter(({ id }) => id === keptOrganisationId || !leadOrganisationIds.has(id));
}
