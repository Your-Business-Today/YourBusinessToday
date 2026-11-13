import { contextPagesOf, firstDomainFilingGap, type DomainFilingGap } from './domainFilingGaps';
import { domainBrainPart, domainPageKinds, type DomainPageKind } from '$lib/data/businessBrainDomain';
import { ensureBusinessBrainPart } from './ensureBusinessBrainPart';
import { fileBusinessBrainSource } from './fileBusinessBrainSource';
import { keepDomainPage, type DomainPageKept, type DomainPagePlace } from './keepDomainPage';
import { moveCoreDomainTo } from './moveCoreDomain';
import type { DomainScope } from './domainScope';
import { readDomainPages } from './readDomainPages';
import { retireDomainPages } from './retireDomainPages';
import type { DomainContextGiven, DomainFilingGiven, DomainPageWriteGiven } from '$lib/data/businessBrainDomainRules';
import type { DomainPage } from '$lib/data/organisationDomain';
import type { SupabaseClient } from '@supabase/supabase-js';

/** What one source's filing did: the source it is kept under, and what became of each context and page. */
export type DomainFilingDone = {
	sourceId: string;
	contexts: DomainPageKept[];
	pages: DomainPageKept[];
	retires: DomainPageKept[];
	coreMovedFrom: DomainPageKept[];
};

/** Who files, into the organisation's own domain or one product's. */
export type DomainFiler = DomainScope & { filerAccountId: string };

/** Files what one source teaches: its contexts first, then the pages beneath them, then the pages it supersedes; nothing when it names what the domain does not hold. */
export async function fileDomainFromSource(
	supabase: SupabaseClient,
	filer: DomainFiler,
	filing: DomainFilingGiven
): Promise<DomainFilingDone | DomainFilingGap | null> {
	const { organisationId, projectId, filerAccountId } = filer;
	const filedPages = await readDomainPages(supabase, filer);
	const gap = firstDomainFilingGap(filing, filedPages);
	if (gap !== null) return gap;
	const sourceId = await fileBusinessBrainSource(supabase, organisationId, filing.source, filerAccountId);
	if (sourceId === null) return null;
	const partId = await ensureBusinessBrainPart(supabase, organisationId, domainBrainPart);
	const place: DomainPagePlace = { organisationId, projectId, partId, sourceId, filerAccountId };
	const contexts = await keepEach(filing.contexts, (context) => keepDomainPage(supabase, place, contextValues(context)));
	const coreMovedFrom = await moveCoreDomainTo(supabase, place, filing.contexts, filedPages);
	const contextIds = contextIdsOf(filedPages, contexts);
	const pages = await keepEach(filing.pages, (page) => keepDomainPage(supabase, place, pageValues(page, contextIds)));
	const retires = await retireDomainPages(supabase, place, filing.retires, pages);
	return { sourceId, contexts, pages, retires, coreMovedFrom };
}

async function keepEach<Given>(givens: Given[], keep: (given: Given) => Promise<DomainPageKept>): Promise<DomainPageKept[]> {
	const kept: DomainPageKept[] = [];
	for (const given of givens) kept.push(await keep(given));
	return kept;
}

function contextIdsOf(filedPages: DomainPage[], contextsKept: DomainPageKept[]): Map<string, string> {
	const filed = contextPagesOf(filedPages).map((page): [string, string] => [page.slug, page.pageId]);
	const keptNow = contextsKept.filter((kept) => kept.pageId !== null).map((kept): [string, string] => [kept.slug, kept.pageId as string]);
	return new Map([...filed, ...keptNow]);
}

function contextValues({ slug, title, summary, body, isCoreDomain }: DomainContextGiven) {
	const kind: DomainPageKind = domainPageKinds.boundedContext;
	return { kind, slug, title, summary, body, facts: { isCoreDomain }, parentPageId: null };
}

function pageValues({ kind, slug, title, summary, body, contextSlug, facts }: DomainPageWriteGiven, contextIds: Map<string, string>) {
	return { kind, slug, title, summary, body, facts: facts ?? {}, parentPageId: contextIds.get(contextSlug) ?? null };
}
