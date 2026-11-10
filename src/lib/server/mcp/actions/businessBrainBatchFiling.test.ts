import { beforeEach, describe, expect, it, vi } from 'vitest';
import { filePages, roofer, roofThread, scaffold } from './businessBrainBatchFixtures';
const brain = vi.hoisted(() => ({
	sharedSourceId: '00000000-0000-0000-0000-0000000000a1',
	slugsAlreadyFiled: [] as string[],
	sourcesNamed: [] as Record<string, unknown>[],
	pagesFiled: [] as Record<string, unknown>[]
}));

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, organisationId: string) =>
		organisationId === 'jewel' ? { id: 'jewel', parentOrganisationId: null, name: 'Jewel Enterprises' } : null
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['business_brain'] }));
vi.mock('$lib/server/businessBrain/ensureBusinessBrainPart', () => ({ ensureBusinessBrainPart: async () => 'part-1' }));
vi.mock('$lib/server/businessBrain/fileBusinessBrainSource', () => ({
	fileBusinessBrainSource: async (_supabase: unknown, _organisationId: string, source: Record<string, unknown>) => {
		brain.sourcesNamed.push(source);
		return brain.sharedSourceId;
	}
}));
vi.mock('$lib/server/businessBrain/fileBusinessBrainPage', () => ({
	findBusinessBrainPage: async (_supabase: unknown, _partId: string, slug: string) =>
		brain.slugsAlreadyFiled.includes(slug) ? { pageId: 'page-0', title: 'Filed before' } : null,
	fileBusinessBrainPage: async (_supabase: unknown, place: Record<string, unknown>) => {
		brain.pagesFiled.push(place);
		return { isNew: true, pageId: 'page-1' };
	}
}));

beforeEach(() => {
	brain.slugsAlreadyFiled = [];
	brain.sourcesNamed = [];
	brain.pagesFiled = [];
});

function newSourcesKept(): string[] {
	return brain.sourcesNamed.flatMap((source) => (typeof source.title === 'string' ? [source.title] : []));
}

describe('filing several pages into Your Business Brain in one call', () => {
	it('files every page under the source named beside them, keeping that source once', async () => {
		const answer = await filePages({ pages: [scaffold, roofer], ...roofThread });
		expect(answer).toContain("Filed 2 of 2 pages into Jewel Enterprises's Your Business Brain.");
		expect(answer).toContain(`source id ${brain.sharedSourceId}`);
		expect(newSourcesKept()).toEqual([roofThread.sourceTitle]);
		expect(brain.sourcesNamed[0]).toMatchObject({ origin: roofThread.sourceOrigin });
		expect(brain.pagesFiled).toHaveLength(2);
	});

	it('answers a page that does not fit by its number and files the others all the same', async () => {
		const answer = await filePages({ pages: [{ ...scaffold, part: 'gossip' }, roofer], ...roofThread });
		expect(answer).toContain('Filed 1 of 2 pages');
		expect(answer).toContain('### 1. "Scaffold at Elm Court": not filed');
		expect(answer).toContain('### 2. "Elm Court roofer": filed');
		expect(brain.pagesFiled).toHaveLength(1);
	});

	it('answers a subject already filed without filing it twice', async () => {
		brain.slugsAlreadyFiled = ['scaffold-at-elm-court'];
		const answer = await filePages({ pages: [scaffold, roofer], ...roofThread });
		expect(answer).toContain('Filed 1 of 2 pages');
		expect(answer).toContain('file_business_brain_page_revision');
	});

	it('keeps the source a page names of its own', async () => {
		const handbook = { ...roofer, sourceTitle: 'Staff handbook 2026', sourceOrigin: 'https://jewel.sharepoint.com/handbook.docx' };
		await filePages({ pages: [scaffold, handbook], ...roofThread });
		expect(newSourcesKept()).toEqual([roofThread.sourceTitle, 'Staff handbook 2026']);
	});

	it('files every page into the organisation the call names, whatever a page says', async () => {
		await filePages({ pages: [{ ...scaffold, organisationId: 'elsewhere' }], ...roofThread });
		expect(brain.pagesFiled[0]).toMatchObject({ organisationId: 'jewel' });
	});
});
