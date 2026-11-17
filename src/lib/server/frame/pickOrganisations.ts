import { findClientCompanies, type ClientCompany } from './clientCompanies';
import { getContactsForAccount } from '$lib/server/clients/getContactsForClient';
import { findLeadOrganisationIds } from '$lib/server/organisations/leadOrganisations';
import { getOrganisations } from '$lib/server/organisations/getOrganisations';
import { leaveOutLeadOrganisations } from '$lib/data/pickableOrganisations';
import type { FramePickOption } from '$lib/components/frame/framePicks';
import type { Organisation } from '$lib/server/organisations/organisationRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * An organisation the side bar offers. One the person is on (every one, for staff) is worked in
 * through its projects; the company of a client they are a contact at, and not on, through the portal.
 * One opened for a lead is not offered until the company becomes a client: it is shown from the lead's own page.
 */
export type PickOrganisation = FramePickOption & {
	organisationId: string | null;
	portalClientId: string | null;
};

export async function readPickOrganisations(
	supabase: SupabaseClient,
	accountId: string
): Promise<PickOrganisation[]> {
	const [organisations, contacts, leadOrganisationIds] = await Promise.all([
		getOrganisations(supabase),
		getContactsForAccount(supabase, accountId),
		findLeadOrganisationIds()
	]);
	const companies = await findClientCompanies(contacts.map((contact) => contact.clientId));
	const reachedIds = new Set(organisations.map((organisation) => organisation.id));
	const companiesOnlyAtPortal = companies.filter((company) => !reachesCompanyOrganisation(reachedIds, company));
	const offered = leaveOutLeadOrganisations(organisations, leadOrganisationIds);
	const picks = [...offered.map(organisationPick), ...companiesOnlyAtPortal.map(companyPick)];
	return picks.sort(byName);
}

function reachesCompanyOrganisation(reachedIds: Set<string>, company: ClientCompany): boolean {
	return company.organisationId !== null && reachedIds.has(company.organisationId);
}

function organisationPick(organisation: Organisation): PickOrganisation {
	const { id, name } = organisation;
	return { id, name, organisationId: id, portalClientId: null };
}

function companyPick(company: ClientCompany): PickOrganisation {
	const { clientId, name, organisationId } = company;
	return { id: clientId, name, organisationId, portalClientId: clientId };
}

function byName(first: FramePickOption, second: FramePickOption): number {
	return first.name.localeCompare(second.name);
}
