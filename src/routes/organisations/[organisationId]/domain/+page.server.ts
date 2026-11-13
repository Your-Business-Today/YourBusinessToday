import { organisationDomainOf } from '$lib/server/businessBrain/organisationDomainOf';
import { isBusinessBrainOpen } from '$lib/server/organisations/isBusinessBrainOpen';
import { readDomainPages } from '$lib/server/businessBrain/readDomainPages';
import { readDomainWords } from '$lib/server/businessBrain/readDomainWords';
import { readTodaysWorkflowMap } from '$lib/server/workflowMap/readTodaysWorkflowMap';
import { requireOrganisationAccess } from '$lib/server/auth/requireOrganisationAccess';
import { thingStationsOf } from '$lib/data/workflowMap/thingStations';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const access = await requireOrganisationAccess(locals, params.organisationId);
	const { organisation, canManage } = access;
	const nothingFiled = { domain: null, words: [], thingStations: [] };
	const isBrainOpen = await isBusinessBrainOpen(locals.supabase, access);
	if (!isBrainOpen) return { organisation, canManage, isBrainOpen, ...nothingFiled };
	const domain = organisationDomainOf(await readDomainPages(locals.supabase, { organisationId: organisation.id, projectId: null }));
	if (domain === null) return { organisation, canManage, isBrainOpen, ...nothingFiled };
	const [words, todaysMap] = await Promise.all([
		readDomainWords(locals.supabase, organisation.id, domain.glossaries),
		readTodaysWorkflowMap(locals.supabase, organisation.id)
	]);
	return { organisation, canManage, isBrainOpen, domain, words, thingStations: thingStationsOf(todaysMap) };
};
