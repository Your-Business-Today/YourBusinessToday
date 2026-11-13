import { domainCompletenessGaps } from '$lib/server/businessBrain/domainCompletenessGaps';
import { organisationDomainOf } from '$lib/server/businessBrain/organisationDomainOf';
import { isBusinessBrainOpen } from '$lib/server/organisations/isBusinessBrainOpen';
import { readDomainPages } from '$lib/server/businessBrain/readDomainPages';
import { readDomainWords } from '$lib/server/businessBrain/readDomainWords';
import { readTodaysWorkflowMap } from '$lib/server/workflowMap/readTodaysWorkflowMap';
import { requireOrganisationAccess } from '$lib/server/auth/requireOrganisationAccess';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { stationsUsingWord } from '$lib/data/workflowMap/mapDomainJoin';
import { stationNamesOf } from '$lib/data/workflowMap/stationNames';
import { thingStationsOf } from '$lib/data/workflowMap/thingStations';
import { wordKey } from '$lib/data/domainWords';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const access = await requireOrganisationAccess(locals, params.organisationId);
	const { organisation, canManage } = access;
	const nothingFiled = { domain: null, words: [], thingStations: [], wordStationCounts: {}, stationNames: {}, questions: [] };
	const isBrainOpen = await isBusinessBrainOpen(locals.supabase, access);
	if (!isBrainOpen) return { organisation, canManage, isBrainOpen, ...nothingFiled };
	const domain = organisationDomainOf(await readDomainPages(locals.supabase, { organisationId: organisation.id, projectId: null }));
	if (domain === null) return { organisation, canManage, isBrainOpen, ...nothingFiled };
	const [words, todaysMap] = await Promise.all([
		readDomainWords(locals.supabase, organisation.id, domain.glossaries),
		readTodaysWorkflowMap(supabaseServiceClient(), organisation.id)
	]);
	const thingStations = thingStationsOf(todaysMap, { things: domain.things, words });
	const wordStationCounts = Object.fromEntries(words.map((word) => [wordKey(word), stationsUsingWord(todaysMap, word)]));
	const stationNames = stationNamesOf(todaysMap);
	const questions = domainCompletenessGaps({ domain, words, map: todaysMap });
	return { organisation, canManage, isBrainOpen, domain, words, thingStations, wordStationCounts, stationNames, questions };
};
