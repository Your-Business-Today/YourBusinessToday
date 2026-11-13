import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clientWork, clientWorkGlossary, contextMap, contractStack, fileDomain, invoicesPassed, job, linksKept, money, signedWord } from './businessBrainDomainFixtures';

const brain = vi.hoisted(() => ({
	pages: new Map<string, Record<string, unknown>>(),
	sources: [] as Record<string, unknown>[]
}));

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, organisationId: string) =>
		organisationId === 'jewel' ? { id: 'jewel', parentOrganisationId: null, name: 'Jewel Enterprises' } : null
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['business_brain'] }));
vi.mock('$lib/server/businessBrain/ensureBusinessBrainPart', () => ({ ensureBusinessBrainPart: async () => 'expertise' }));
vi.mock('$lib/server/businessBrain/fileBusinessBrainSource', () => ({
	fileBusinessBrainSource: async (_supabase: unknown, _organisationId: string, source: Record<string, unknown>) => {
		brain.sources.push(source);
		return 'source-1';
	}
}));
vi.mock('$lib/server/businessBrain/readDomainPages', async () => {
	const { readDomainPageFacts } = await import('$lib/data/businessBrainDomainFacts');
	return {
		readDomainPages: async () =>
			[...brain.pages.values()].map((page) => ({ ...page, facts: readDomainPageFacts(page.facts) }))
	};
});
vi.mock('$lib/server/businessBrain/domainPageStanding', async (importOriginal) => ({
	...(await importOriginal<object>()),
	readDomainPageStanding: async (_supabase: unknown, _partId: string, slug: string) => brain.pages.get(slug) ?? null
}));
vi.mock('$lib/server/businessBrain/keepDomainPage', async (importOriginal) => ({
	...(await importOriginal<object>()),
	keepDomainPage: async (_supabase: unknown, _place: unknown, values: Record<string, unknown>) => {
		const slug = values.slug as string;
		const standing = brain.pages.get(slug);
		const pageId = (standing?.pageId as string | undefined) ?? `page-${slug}`;
		brain.pages.set(slug, { ...values, pageId });
		return { slug, title: values.title, pageId, outcome: standing === undefined ? 'filed' : 'revised' };
	}
}));

function pageAt(slug: string): Record<string, unknown> {
	return brain.pages.get(slug) ?? {};
}

beforeEach(() => {
	brain.pages.clear();
	linksKept.length = 0;
	brain.sources = [];
});

describe('filing what one source teaches about the domain', () => {
	it('files the context first and places each page beneath it', async () => {
		const answer = await fileDomain({ contexts: [clientWork], pages: [job] });
		expect(answer).toContain('Filed "Job" (job, page id page-job)');
		expect(pageAt('client-work')).toMatchObject({ kind: 'bounded_context', facts: { isCoreDomain: true }, parentPageId: null });
		expect(pageAt('job')).toMatchObject({ kind: 'entity', parentPageId: 'page-client-work' });
	});

	it('refuses a page in a context neither filed nor given, writing nothing and keeping no source', async () => {
		const answer = await fileDomain({ pages: [job] });
		expect(answer).toContain('No bounded context client-work is filed or given in contexts');
		const slugsKept = [...brain.pages.keys()];
		expect(slugsKept).toEqual([]);
		expect(brain.sources).toEqual([]);
	});

	it('moves the core domain: the context marked before is unmarked by a revision', async () => {
		await fileDomain({ contexts: [clientWork] });
		const answer = await fileDomain({ contexts: [{ ...clientWork, slug: 'money', name: 'Money' }] });
		expect(answer).toContain('No longer the core domain:');
		expect(pageAt('client-work')).toMatchObject({ facts: { isCoreDomain: false } });
	});

	it('supersedes a specimen folded into its concept: out of the domain, linked to the concept, never deleted', async () => {
		await fileDomain({ contexts: [clientWork], pages: [{ ...job, slug: 'elm-court-job', title: 'Elm Court job' }] });
		const answer = await fileDomain({ pages: [job], retires: [{ slug: 'elm-court-job', foldedIntoSlug: 'job' }] });
		expect(answer).toContain('Superseded, out of the domain');
		expect(pageAt('elm-court-job')).toMatchObject({ kind: 'superseded', body: 'Superseded: what this page knew was folded into "Job" (job).' });
		expect(linksKept).toEqual([{ organisation_id: 'jewel', from_page_id: 'page-elm-court-job', to_page_id: 'page-job', link_kind: 'superseded_by' }]);
	});

	it('files nothing when the source teaches the domain nothing', async () => {
		expect(await fileDomain({})).toContain('Nothing was filed');
		expect(brain.sources).toEqual([]);
	});

	it('keeps what each word names, each area’s part and how the areas relate, refusing a status the thing lacks', async () => {
		const sealed = { ...clientWorkGlossary, terms: [{ ...signedWord, namesStatus: 'Sealed' }] };
		const refusal = await fileDomain({ contexts: [clientWork], pages: [contractStack, sealed] });
		expect(refusal).toContain('"signed contract stack" names contract-stack in Sealed, which is not a status of it: its statuses are Drafted, Signed.');
		await fileDomain({ contexts: [clientWork, money], pages: [contractStack, clientWorkGlossary, contextMap] });
		expect(pageAt('client-work-glossary')).toMatchObject({ facts: { terms: [signedWord] } });
		expect(pageAt('money')).toMatchObject({ facts: { isCoreDomain: false, subdomain: 'generic' } });
		expect(pageAt('context-map')).toMatchObject({ facts: { relationships: [invoicesPassed] } });
	});
});
