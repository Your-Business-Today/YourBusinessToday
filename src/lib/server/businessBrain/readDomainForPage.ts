import { domainCompletenessGaps } from './domainCompletenessGaps';
import { organisationDomainOf } from './organisationDomainOf';
import { isBusinessBrainOpen } from '$lib/server/organisations/isBusinessBrainOpen';
import { readDomainPages } from './readDomainPages';
import { readDomainWords } from './readDomainWords';
import { readThingPage } from './readThingPage';
import { readTodaysWorkflowMap } from '$lib/server/workflowMap/readTodaysWorkflowMap';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { domainThingOf } from '$lib/components/organisations/domain/domainTabs';
import { stationsUsingWord } from '$lib/data/workflowMap/mapDomainJoin';
import { thingNamed } from '$lib/data/domainThingLinks';
import { stationNamesOf } from '$lib/data/workflowMap/stationNames';
import { thingStationsOf } from '$lib/data/workflowMap/thingStations';
import { wordKey } from '$lib/data/domainWords';
import type { OrganisationAccess } from '$lib/server/auth/requireOrganisationAccess';

export type OrganisationDomainReading = Awaited<ReturnType<typeof readDomainForPage>>;

/** The organisation's domain as its Domain page shows it, wherever that page is shown from, with the thing the address opens. */
export async function readDomainForPage(locals: App.Locals, access: OrganisationAccess, url: URL) {
	const { organisation } = access;
	const nothingFiled = { domain: null, words: [], thingStations: [], wordStationCounts: {}, stationNames: {}, questions: [], thingPage: null };
	const isBrainOpen = await isBusinessBrainOpen(locals.supabase, access);
	if (!isBrainOpen) return { isBrainOpen, ...nothingFiled };
	const domain = organisationDomainOf(await readDomainPages(locals.supabase, { organisationId: organisation.id, projectId: null }));
	if (domain === null) return { isBrainOpen, ...nothingFiled };
	const openedThing = thingNamed(domain.things, domainThingOf(url));
	const [words, todaysMap, thingPage] = await Promise.all([
		readDomainWords(locals.supabase, organisation.id, domain.glossaries),
		readTodaysWorkflowMap(supabaseServiceClient(), organisation.id),
		openedThing === undefined ? null : readThingPage(locals.supabase, organisation.id, openedThing.pageId)
	]);
	const thingStations = thingStationsOf(todaysMap, { things: domain.things, words });
	const wordStationCounts = Object.fromEntries(words.map((word) => [wordKey(word), stationsUsingWord(todaysMap, word)]));
	const stationNames = stationNamesOf(todaysMap);
	const questions = domainCompletenessGaps({ domain, words, map: todaysMap });
	return { isBrainOpen, domain, words, thingStations, wordStationCounts, stationNames, questions, thingPage };
}
