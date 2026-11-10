import { ensureBusinessBrainPart } from '$lib/server/businessBrain/ensureBusinessBrainPart';
import { fileBusinessBrainPage, findBusinessBrainPage } from '$lib/server/businessBrain/fileBusinessBrainPage';
import { fileBusinessBrainSource } from '$lib/server/businessBrain/fileBusinessBrainSource';
import { nameBusinessBrainPageFiles } from '$lib/server/businessBrain/nameBusinessBrainPageFiles';
import {
	noSuchPage,
	noSuchSource,
	nothingNewToFile,
	pageFiled,
	revisedMeanwhile,
	revisionFiled,
	subjectAlreadyFiled
} from './businessBrainAnswers';
import { sourceFilesToName } from './businessBrainSourceFiles';
import { filesNamedOnUnchangedPage, withFilesNamed } from './businessBrainFileAnswers';
import { readBusinessBrainPage, reviseBusinessBrainPage, type BusinessBrainPageStanding } from '$lib/server/businessBrain/reviseBusinessBrainPage';
import { validateBusinessBrainPage } from '$lib/server/businessBrain/validateBusinessBrainPage';
import { validateBusinessBrainRevision } from '$lib/server/businessBrain/validateBusinessBrainRevision';
import type { BusinessBrainRevisionGiven } from '$lib/data/businessBrainRules';
import type { McpCaller } from '../resolveMcpCaller';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** Files a new page, unless the part already holds a page on its subject. */
export async function fileNewPage(caller: McpCaller, input: Record<string, unknown>, organisation: Organisation): Promise<string> {
	const page = validateBusinessBrainPage(input);
	if (typeof page === 'string') return page;
	const { supabase } = caller;
	const sourceFileIds = await sourceFilesToName(supabase, organisation.id, input);
	if (typeof sourceFileIds === 'string') return sourceFileIds;
	const partId = await ensureBusinessBrainPart(supabase, organisation.id, page.part);
	const alreadyFiled = await findBusinessBrainPage(supabase, partId, page.slug);
	if (alreadyFiled !== null) return subjectAlreadyFiled(organisation, page, alreadyFiled);
	const sourceId = await fileBusinessBrainSource(supabase, organisation.id, page.source, caller.accountId);
	if (sourceId === null) return noSuchSource;
	const filing = await fileBusinessBrainPage(supabase, { organisationId: organisation.id, partId, sourceId }, page);
	if (!filing.isNew) return subjectAlreadyFiled(organisation, page, filing);
	await nameBusinessBrainPageFiles(supabase, { organisationId: organisation.id, pageId: filing.pageId }, sourceFileIds);
	return withFilesNamed(pageFiled(organisation, page, { pageId: filing.pageId, sourceId }), sourceFileIds);
}

/** Files a revision of a page, keeping the page as it stood in its history. */
export async function fileRevision(caller: McpCaller, input: Record<string, unknown>, organisation: Organisation): Promise<string> {
	const revision = validateBusinessBrainRevision(input);
	if (typeof revision === 'string') return revision;
	const { supabase } = caller;
	const sourceFileIds = await sourceFilesToName(supabase, organisation.id, input);
	if (typeof sourceFileIds === 'string') return sourceFileIds;
	const standing = await readBusinessBrainPage(supabase, organisation.id, revision.pageId);
	if (standing === null) return noSuchPage;
	const page = { organisationId: organisation.id, pageId: standing.pageId };
	if (readsTheSame(standing, revision)) return nameFilesOnly(supabase, page, sourceFileIds);
	const sourceId = await fileBusinessBrainSource(supabase, organisation.id, revision.source, caller.accountId);
	if (sourceId === null) return noSuchSource;
	const reviser = { ...standing, organisationId: organisation.id, reviserAccountId: caller.accountId };
	const isRevised = await reviseBusinessBrainPage(supabase, reviser, { ...revision, sourceId });
	if (!isRevised) return revisedMeanwhile;
	await nameBusinessBrainPageFiles(supabase, page, sourceFileIds);
	return withFilesNamed(revisionFiled(organisation, revision.title, { pageId: standing.pageId, sourceId }), sourceFileIds);
}

async function nameFilesOnly(supabase: SupabaseClient, page: { organisationId: string; pageId: string }, fileIds: string[]): Promise<string> {
	if (fileIds.length === 0) return nothingNewToFile;
	await nameBusinessBrainPageFiles(supabase, page, fileIds);
	return filesNamedOnUnchangedPage(fileIds);
}

function readsTheSame(standing: BusinessBrainPageStanding, revision: BusinessBrainRevisionGiven): boolean {
	const kind = revision.kind ?? standing.kind;
	const summary = revision.summary ?? standing.summary;
	const isSameWording = revision.title === standing.title && revision.body === standing.body;
	return isSameWording && kind === standing.kind && summary === standing.summary;
}
