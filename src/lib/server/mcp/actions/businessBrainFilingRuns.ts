import { ensureBusinessBrainPart } from '$lib/server/businessBrain/ensureBusinessBrainPart';
import { fileBusinessBrainPage, findBusinessBrainPage } from '$lib/server/businessBrain/fileBusinessBrainPage';
import { fileBusinessBrainSource } from '$lib/server/businessBrain/fileBusinessBrainSource';
import {
	noSuchPage,
	noSuchSource,
	nothingNewToFile,
	pageFiled,
	revisedMeanwhile,
	revisionFiled,
	subjectAlreadyFiled
} from './businessBrainAnswers';
import { readBusinessBrainPage, reviseBusinessBrainPage, type BusinessBrainPageStanding } from '$lib/server/businessBrain/reviseBusinessBrainPage';
import { validateBusinessBrainPage } from '$lib/server/businessBrain/validateBusinessBrainPage';
import { validateBusinessBrainRevision } from '$lib/server/businessBrain/validateBusinessBrainRevision';
import type { BusinessBrainRevisionGiven } from '$lib/data/businessBrainRules';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** Files a new page, unless the part already holds a page on its subject. */
export async function fileNewPage(caller: McpCaller, input: Record<string, unknown>, organisation: Organisation): Promise<string> {
	const page = validateBusinessBrainPage(input);
	if (typeof page === 'string') return page;
	const { supabase } = caller;
	const partId = await ensureBusinessBrainPart(supabase, organisation.id, page.part);
	const alreadyFiled = await findBusinessBrainPage(supabase, partId, page.slug);
	if (alreadyFiled !== null) return subjectAlreadyFiled(organisation, page, alreadyFiled);
	const sourceId = await fileBusinessBrainSource(supabase, organisation.id, page.source, caller.accountId);
	if (sourceId === null) return noSuchSource;
	const filing = await fileBusinessBrainPage(supabase, { organisationId: organisation.id, partId, sourceId }, page);
	if (!filing.isNew) return subjectAlreadyFiled(organisation, page, filing);
	return pageFiled(organisation, page, { pageId: filing.pageId, sourceId });
}

/** Files a revision of a page, keeping the page as it stood in its history. */
export async function fileRevision(caller: McpCaller, input: Record<string, unknown>, organisation: Organisation): Promise<string> {
	const revision = validateBusinessBrainRevision(input);
	if (typeof revision === 'string') return revision;
	const { supabase } = caller;
	const standing = await readBusinessBrainPage(supabase, organisation.id, revision.pageId);
	if (standing === null) return noSuchPage;
	if (readsTheSame(standing, revision)) return nothingNewToFile;
	const sourceId = await fileBusinessBrainSource(supabase, organisation.id, revision.source, caller.accountId);
	if (sourceId === null) return noSuchSource;
	const reviser = { ...standing, organisationId: organisation.id, reviserAccountId: caller.accountId };
	const isRevised = await reviseBusinessBrainPage(supabase, reviser, { ...revision, sourceId });
	if (!isRevised) return revisedMeanwhile;
	return revisionFiled(organisation, revision.title, { pageId: standing.pageId, sourceId });
}

function readsTheSame(standing: BusinessBrainPageStanding, revision: BusinessBrainRevisionGiven): boolean {
	const kind = revision.kind ?? standing.kind;
	const summary = revision.summary ?? standing.summary;
	const isSameWording = revision.title === standing.title && revision.body === standing.body;
	return isSameWording && kind === standing.kind && summary === standing.summary;
}
