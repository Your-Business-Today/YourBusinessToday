import type { SupabaseClient } from '@supabase/supabase-js';
import { fitsOrganisationName } from '$lib/data/organisationRules';
import { getClient } from '$lib/server/clients/getClient';
import { isRefusal, type Refusal } from '$lib/server/portal/portalFormReading';
import { setOrganisationModule } from '$lib/server/organisations/setOrganisationModule';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { leadOrganisationRefusals as refusals } from './leadOrganisationRefusals';
import { createOrganisationForClient, linkOrganisationToClient } from './leadOrganisationRows';
import { findOrganisationLinkById, findOrganisationLinkOfClient, findTopOrganisationNamed, type OrganisationLink } from './organisationLinks';
import type { OrganisationModule } from '$lib/data/organisationModules';

export type LeadOrganisationRequest = { clientId: string; organisationId: string | null; actorAccountId: string };

export const leadOrganisationOpenings = { alreadyLinked: 'already linked', linked: 'linked', created: 'created' } as const;
export type LeadOrganisationOpening = (typeof leadOrganisationOpenings)[keyof typeof leadOrganisationOpenings];

type Opening = { organisation: OrganisationLink; opening: LeadOrganisationOpening };
export type OpenedLeadOrganisation = Opening & { companyName: string };

type Company = { id: string; name: string };
type Opener = { service: SupabaseClient; company: Company; actorAccountId: string };

const domainKeeper: OrganisationModule = 'business_brain';

/**
 * Gives a company on the register its own organisation before it signs, so its domain and workflow map can be
 * built: the one already linked, else one of its exact name linked to nothing, else a new one. Only staff reach
 * this and it writes with the service key. It invites nobody, sends no email and makes no project.
 */
export async function openLeadOrganisation(request: LeadOrganisationRequest): Promise<OpenedLeadOrganisation | Refusal> {
	const service = supabaseServiceClient();
	const company = await getClient(service, request.clientId);
	if (company === null) return refusals.noSuchCompany;
	const opener = { service, company, actorAccountId: request.actorAccountId };
	const opened = await organisationToOpen(opener, request.organisationId);
	if (isRefusal(opened)) return opened;
	await switchDomainKeeperOn(opener, opened.organisation);
	return { ...opened, companyName: company.name };
}

async function switchDomainKeeperOn({ service, actorAccountId }: Opener, organisation: OrganisationLink): Promise<void> {
	await setOrganisationModule(service, { organisationId: organisation.id, module: domainKeeper, isOn: true, switchedBy: actorAccountId });
}

async function organisationToOpen(opener: Opener, namedOrganisationId: string | null): Promise<Opening | Refusal> {
	const { service, company } = opener;
	const linked = await findOrganisationLinkOfClient(service, company.id);
	if (namedOrganisationId !== null) return openNamedOrganisation(opener, namedOrganisationId, linked);
	if (linked !== null) return { organisation: linked, opening: leadOrganisationOpenings.alreadyLinked };
	return openByName(opener);
}

async function openNamedOrganisation(opener: Opener, organisationId: string, linked: OrganisationLink | null): Promise<Opening | Refusal> {
	const { service, company } = opener;
	const isAnotherLinkedAlready = linked !== null && linked.id !== organisationId;
	if (isAnotherLinkedAlready) return refusals.companyHasAnother(company, linked);
	const organisation = await findOrganisationLinkById(service, organisationId);
	if (organisation === null) return refusals.noSuchOrganisation;
	const isLinkedToThisCompany = organisation.clientId === company.id;
	if (isLinkedToThisCompany) return { organisation, opening: leadOrganisationOpenings.alreadyLinked };
	return linkUnlinkedOrganisation(opener, organisation);
}

async function openByName(opener: Opener): Promise<Opening | Refusal> {
	const { service, company, actorAccountId } = opener;
	const namesake = await findTopOrganisationNamed(service, company.name);
	if (namesake !== null) return linkUnlinkedOrganisation(opener, namesake);
	if (!fitsOrganisationName(company.name)) return refusals.nameTooLong;
	const created = await createOrganisationForClient(service, company.name, company.id, actorAccountId);
	if (created === null) return refusals.nameTaken(company);
	return { organisation: created, opening: leadOrganisationOpenings.created };
}

async function linkUnlinkedOrganisation(opener: Opener, organisation: OrganisationLink): Promise<Opening | Refusal> {
	const isLinkedElsewhere = organisation.clientId !== null;
	if (isLinkedElsewhere) return refusals.linkedElsewhere(organisation);
	const { service, company } = opener;
	const linked = await linkOrganisationToClient(service, organisation.id, company.id);
	if (linked === null) return refusals.linkedElsewhere(organisation);
	return { organisation: linked, opening: leadOrganisationOpenings.linked };
}
