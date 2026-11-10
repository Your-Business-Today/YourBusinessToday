import { fileBusinessBrainSource } from '$lib/server/businessBrain/fileBusinessBrainSource';
import { validateBusinessBrainPage } from '$lib/server/businessBrain/validateBusinessBrainPage';
import { validateBusinessBrainSource } from '$lib/server/businessBrain/validateBusinessBrainSource';
import {
	entryTitle,
	namesASource,
	sourceFieldsOf,
	validateBusinessBrainPageList,
	type BusinessBrainPageEntry
} from '$lib/server/businessBrain/validateBusinessBrainPageList';
import { settleNewPage } from './businessBrainFilingRuns';
import { noSuchSource } from './businessBrainAnswers';
import { pagesSettled, sharedSourceRefused, type BusinessBrainPageInList } from './businessBrainBatchAnswers';
import type { BusinessBrainSourceGiven } from '$lib/data/businessBrainRules';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** A page of the list, and whether it takes the source named beside the list. */
type PageToFile = { entry: BusinessBrainPageEntry; isOnSharedSource: boolean; isFitting: boolean };

/** Files several pages in one call, each settled on its own: one refused or already filed leaves the others filed. */
export async function fileSeveralPages(caller: McpCaller, input: Record<string, unknown>, organisation: Organisation): Promise<string> {
	const entries = validateBusinessBrainPageList(input.pages);
	if (typeof entries === 'string') return entries;
	const sharedSource = namesASource(input) ? validateBusinessBrainSource(input) : null;
	if (typeof sharedSource === 'string') return sharedSourceRefused(sharedSource);
	const pages = entries.map((entry) => pageToFile(entry, input, sharedSource !== null));
	const sharedSourceId = await fileSharedSource(caller, organisation, sharedSource, pages);
	if (sharedSourceId === undefined) return noSuchSource;
	const settled: BusinessBrainPageInList[] = [];
	for (const page of pages) settled.push(await settlePage(caller, organisation, page, sharedSourceId));
	return pagesSettled(organisation, settled, sharedSourceId);
}

function pageToFile(entry: BusinessBrainPageEntry, input: Record<string, unknown>, isSourceShared: boolean): PageToFile {
	const isOnSharedSource = isSourceShared && !namesASource(entry);
	const checked = isOnSharedSource ? { ...entry, ...sourceFieldsOf(input) } : entry;
	const isFitting = typeof validateBusinessBrainPage(checked) !== 'string';
	return { entry, isOnSharedSource, isFitting };
}

/** The shared source's id, kept only when a page that fits takes it; null when none does, undefined when its id is not this organisation's. */
async function fileSharedSource(
	caller: McpCaller,
	organisation: Organisation,
	sharedSource: BusinessBrainSourceGiven | null,
	pages: PageToFile[]
): Promise<string | null | undefined> {
	const isTaken = pages.some((page) => page.isOnSharedSource && page.isFitting);
	if (sharedSource === null || !isTaken) return null;
	const sourceId = await fileBusinessBrainSource(caller.supabase, organisation.id, sharedSource, caller.accountId);
	return sourceId ?? undefined;
}

async function settlePage(
	caller: McpCaller,
	organisation: Organisation,
	page: PageToFile,
	sharedSourceId: string | null
): Promise<BusinessBrainPageInList> {
	const sourced = page.isOnSharedSource ? { ...page.entry, sourceId: sharedSourceId } : page.entry;
	const settled = await settleNewPage(caller, { ...sourced, organisationId: organisation.id }, organisation);
	return { title: entryTitle(page.entry), ...settled };
}
