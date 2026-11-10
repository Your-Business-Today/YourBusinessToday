import { readBusinessBrainIndex } from '$lib/server/businessBrain/readBusinessBrainIndex';
import { readBusinessBrainPageHistory, readBusinessBrainRevision } from '$lib/server/businessBrain/readBusinessBrainPageHistory';
import { readBusinessBrainPageLinks, readPageTitles } from '$lib/server/businessBrain/readBusinessBrainPageLinks';
import { readBusinessBrainPageWhole, type BusinessBrainPageRead } from '$lib/server/businessBrain/readBusinessBrainPageWhole';
import { searchBusinessBrain } from '$lib/server/businessBrain/searchBusinessBrain';
import {
	validateBusinessBrainPageAsked,
	validateBusinessBrainPart,
	validateBusinessBrainSearch
} from '$lib/server/businessBrain/validateBusinessBrainReading';
import { describeBusinessBrainIndex, describeBusinessBrainSearch, searchNotReadyYet } from './businessBrainListings';
import {
	describeBusinessBrainPage,
	describeBusinessBrainRevision,
	noSuchPageToRead,
	noSuchRevision,
	type BusinessBrainPageSurroundings
} from './describeBusinessBrainPage';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The index of the brain, or of one part of it. */
export async function readIndex(caller: McpCaller, input: Record<string, unknown>, organisation: Organisation): Promise<string> {
	const asked = validateBusinessBrainPart(input);
	if (typeof asked === 'string') return asked;
	const index = await readBusinessBrainIndex(caller.supabase, organisation.id, asked.part);
	return describeBusinessBrainIndex(organisation, index);
}

/** The pages that match the words, best first. */
export async function searchBrain(caller: McpCaller, input: Record<string, unknown>, organisation: Organisation): Promise<string> {
	const asked = validateBusinessBrainSearch(input);
	if (typeof asked === 'string') return asked;
	const matches = await searchBusinessBrain(caller.supabase, organisation.id, asked.searchText);
	if (matches === null) return searchNotReadyYet;
	return describeBusinessBrainSearch(organisation, asked.searchText, matches);
}

/** One page with its history, or one earlier version of it when a revision is named. */
export async function readPage(caller: McpCaller, input: Record<string, unknown>, organisation: Organisation): Promise<string> {
	const asked = validateBusinessBrainPageAsked(input);
	if (typeof asked === 'string') return asked;
	const { supabase } = caller;
	const page = await readBusinessBrainPageWhole(supabase, organisation.id, asked.pageId);
	if (page === null) return noSuchPageToRead;
	const { revisionId } = asked;
	if (revisionId === null) return readCurrentPage(supabase, organisation, page);
	const place = { organisationId: organisation.id, pageId: page.pageId };
	const revision = await readBusinessBrainRevision(supabase, place, revisionId);
	if (revision === null) return noSuchRevision;
	return describeBusinessBrainRevision(organisation, page, revision);
}

async function readCurrentPage(supabase: SupabaseClient, organisation: Organisation, page: BusinessBrainPageRead): Promise<string> {
	const surroundings = await readSurroundings(supabase, organisation.id, page);
	return describeBusinessBrainPage(organisation, page, surroundings);
}

async function readSurroundings(
	supabase: SupabaseClient,
	organisationId: string,
	page: BusinessBrainPageRead
): Promise<BusinessBrainPageSurroundings> {
	const links = await readBusinessBrainPageLinks(supabase, organisationId, page.pageId);
	const history = await readBusinessBrainPageHistory(supabase, organisationId, page.pageId);
	const parent = await readParent(supabase, organisationId, page.parentPageId);
	return { parent, links, history };
}

async function readParent(supabase: SupabaseClient, organisationId: string, parentPageId: string | null) {
	if (parentPageId === null) return null;
	const titles = await readPageTitles(supabase, organisationId, [parentPageId]);
	return { pageId: parentPageId, title: titles.get(parentPageId) ?? '' };
}
