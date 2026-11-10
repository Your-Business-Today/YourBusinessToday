import { beforeEach, describe, expect, it, vi } from 'vitest';
import { filePages, filePagesGuidance, roofer, roofThread, scaffold } from './businessBrainBatchFixtures';
import { pageListRefusal } from '$lib/server/businessBrain/validateBusinessBrainPageList';

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

describe('what filing several pages refuses', () => {
	it('refuses a page with no source when none is named beside the pages', async () => {
		const answer = await filePages({ pages: [scaffold] });
		expect(answer).toContain('Filed 0 of 1 pages');
		expect(answer).toContain('sourceTitle');
		expect(brain.sourcesNamed).toHaveLength(0);
	});

	it('refuses a source given only in part rather than dropping it', async () => {
		const answer = await filePages({ pages: [{ ...roofer, sourceOrigin: 'https://jewel.sharepoint.com/plan.pdf' }], ...roofThread });
		expect(answer).toContain('Filed 0 of 1 pages');
		expect(brain.sourcesNamed).toHaveLength(0);
	});

	it('keeps no source beside the pages when no page that fits takes it', async () => {
		await filePages({ pages: [{ ...scaffold, kind: 'Not A Kind' }], ...roofThread });
		expect(brain.sourcesNamed).toHaveLength(0);
	});

	it('refuses a list that is empty, too long or not a list, filing nothing', async () => {
		const tooMany = Array.from({ length: 21 }, () => scaffold);
		for (const pages of [[], tooMany, 'scaffold']) expect(await filePages({ pages, ...roofThread })).toBe(pageListRefusal);
		expect(brain.pagesFiled).toHaveLength(0);
	});

	it('refuses the whole call when the source beside the pages does not fit', async () => {
		const answer = await filePages({ pages: [scaffold], sourceTitle: 'x'.repeat(201) });
		expect(answer).toContain('nothing was filed');
		expect(brain.pagesFiled).toHaveLength(0);
	});

	it('tells Claude how to file what it reads in Microsoft 365', () => {
		expect(filePagesGuidance).toContain('SharePoint');
		expect(filePagesGuidance).toContain('one subject and a date range');
	});
});
