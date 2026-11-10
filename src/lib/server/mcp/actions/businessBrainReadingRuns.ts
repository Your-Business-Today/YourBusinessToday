import { readBusinessBrainIndex } from '$lib/server/businessBrain/readBusinessBrainIndex';
import { readBusinessBrainPageHistory, readBusinessBrainRevision } from '$lib/server/businessBrain/readBusinessBrainPageHistory';
import { readBusinessBrainPageLinks, readPageTitles } from '$lib/server/businessBrain/readBusinessBrainPageLinks';
import { readBusinessBrainPageWhole, type BusinessBrainPageRead } from '$lib/server/businessBrain/readBusinessBrainPageWhole';
import { searchBusinessBrain } from '$lib/server/businessBrain/searchBusinessBrain';
import { readFilesNamedByPage, readKeptBusinessBrainFiles, type KeptBusinessBrainFile } from '$lib/server/businessBrain/readKeptBusinessBrainFiles';
import { keptFilesSection } from './businessBrainKeptFileSections';
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
import { organisationDoor, type BusinessBrainDoor } from './businessBrainDoor';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The index of the brain, or of one part of it, with the files it keeps. */
export async function readIndex(caller: McpCaller, input: Record<string, unknown>, organisation: Organisation): Promise<string> {
	const asked = validateBusinessBrainPart(input);
	if (typeof asked === 'string') return asked;
	const index = await readBusinessBrainIndex(caller.supabase, organisation.id, asked.part);
	const kept = await readKeptBusinessBrainFiles(caller.supabase, organisation.id);
	return [describeBusinessBrainIndex(organisationDoor(organisation), index), ...keptFilesSection(kept)].join('\n');
}

/** The pages that match the words, best first. */
export async function searchBrain(caller: McpCaller, input: Record<string, unknown>, organisation: Organisation): Promise<string> {
	const asked = validateBusinessBrainSearch(input);
	if (typeof asked === 'string') return asked;
	const matches = await searchBusinessBrain(caller.supabase, organisation.id, asked.searchText);
	if (matches === null) return searchNotReadyYet;
	return describeBusinessBrainSearch(organisationDoor(organisation), asked.searchText, matches);
}

/** One page with its history, or one earlier version of it when a revision is named. */
export async function readPage(caller: McpCaller, input: Record<string, unknown>, organisation: Organisation): Promise<string> {
	const asked = validateBusinessBrainPageAsked(input);
	if (typeof asked === 'string') return asked;
	const { supabase } = caller;
	const page = await readBusinessBrainPageWhole(supabase, organisation.id, asked.pageId);
	if (page === null) return noSuchPageToRead;
	const door = organisationDoor(organisation);
	const { revisionId } = asked;
	if (revisionId !== null) return readRevisionOfPage(supabase, door, page, { organisationId: organisation.id, revisionId });
	const files = await readFilesNamedByPage(supabase, { organisationId: organisation.id, pageId: page.pageId });
	return readCurrentPage(supabase, organisation, page, files);
}

/** The page as it now reads, with the page above it, its links, its history and any files it names. */
export async function readCurrentPage(
	supabase: SupabaseClient,
	organisation: Organisation,
	page: BusinessBrainPageRead,
	files: KeptBusinessBrainFile[] = []
): Promise<string> {
	const surroundings = await readSurroundings(supabase, organisation.id, page);
	return describeBusinessBrainPage(organisationDoor(organisation), page, surroundings, files);
}

/** One earlier version of the page, or a plain word that its history holds none by that id. */
export async function readRevisionOfPage(
	supabase: SupabaseClient,
	door: BusinessBrainDoor,
	page: BusinessBrainPageRead,
	asked: { organisationId: string; revisionId: number }
): Promise<string> {
	const place = { organisationId: asked.organisationId, pageId: page.pageId };
	const revision = await readBusinessBrainRevision(supabase, place, asked.revisionId);
	if (revision === null) return noSuchRevision;
	return describeBusinessBrainRevision(door, page, revision);
}

/** What a page is read with: the page it sits under, the pages linked to and from it, and its history. */
export async function readSurroundings(
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
