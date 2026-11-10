import { beforeEach, describe, expect, it, vi } from 'vitest';
import { businessBrainActions } from './businessBrainActions';
import { moduleNotSwitchedOn } from '../organisationModuleGate';
import { searchNotReadyYet } from './businessBrainListings';
import { noSuchPageToRead, noSuchRevision } from './describeBusinessBrainPage';
import { brainAction as action, nigelOnJewel, openingHours, pageId, staffHandbook } from './businessBrainReadingFixtures';

const brain = vi.hoisted(() => ({
	switchedOn: ['business_brain'] as string[],
	matches: [] as unknown[] | null,
	page: null as Record<string, unknown> | null,
	revision: null as Record<string, unknown> | null,
	history: { entries: [] as unknown[], revisionCount: 0 }
}));

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, organisationId: string) =>
		organisationId === 'jewel' ? { id: 'jewel', parentOrganisationId: null, name: 'Jewel Enterprises' } : null
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => brain.switchedOn }));
vi.mock('$lib/server/businessBrain/readBusinessBrainIndex', () => ({ readBusinessBrainIndex: async () => ({ entries: [openingHours], pageCount: 1 }) }));
vi.mock('$lib/server/businessBrain/searchBusinessBrain', () => ({ searchBusinessBrain: async () => brain.matches }));
vi.mock('$lib/server/businessBrain/readBusinessBrainPageWhole', () => ({ readBusinessBrainPageWhole: async () => brain.page }));
vi.mock('$lib/server/businessBrain/readBusinessBrainPageLinks', () => ({
	readBusinessBrainPageLinks: async () => [{ pageId: 'page-2', title: 'Fire door checks', linkKind: 'relates_to', isFromThisPage: true }],
	readPageTitles: async () => new Map()
}));
vi.mock('$lib/server/businessBrain/readBusinessBrainPageHistory', () => ({
	readBusinessBrainPageHistory: async () => brain.history,
	readBusinessBrainRevision: async () => brain.revision
}));

describe('reading Your Business Brain', () => {
	beforeEach(() => {
		brain.switchedOn = ['business_brain'];
		brain.matches = [];
		brain.page = { ...openingHours, parentPageId: null, body: 'Eight to six.', facts: { opens: '08:00' }, source: staffHandbook };
		brain.revision = null;
		brain.history = { entries: [], revisionCount: 0 };
	});

	it('reads nothing while Your Business Brain is off for the organisation', async () => {
		brain.switchedOn = ['books'];
		for (const name of ['read_business_brain_index', 'search_business_brain', 'read_business_brain_page']) {
			expect(await action(name).run(nigelOnJewel, { organisationId: 'jewel', search: 'hours', pageId })).toBe(moduleNotSwitchedOn('business_brain'));
		}
	});

	it('only reads', () => {
		const reads = businessBrainActions.filter((candidate) => candidate.name.startsWith('read_') || candidate.name.startsWith('search_'));
		expect(reads.map((read) => read.isWrite)).toEqual([false, false, false]);
	});

	it('lists the pages under their part, with their ids', async () => {
		const answer = await action('read_business_brain_index').run(nigelOnJewel, { organisationId: 'jewel' });
		expect(answer).toContain("# Jewel Enterprises's Your Business Brain: one page");
		expect(answer).toContain('## Process');
		expect(answer).toContain(`**Opening hours** (rule, page id ${pageId}`);
	});

	it('says the brain is silent when a search finds nothing', async () => {
		const answer = await action('search_business_brain').run(nigelOnJewel, { organisationId: 'jewel', search: 'parking' });
		expect(answer).toContain('holds no page that matches "parking"');
	});

	it('lists what a search found, best first, with its excerpt', async () => {
		brain.matches = [{ ...openingHours, excerpt: 'opens at **eight**' }];
		const answer = await action('search_business_brain').run(nigelOnJewel, { organisationId: 'jewel', search: 'eight' });
		expect(answer).toContain(`1. **Opening hours** — Process, rule, page id ${pageId}`);
		expect(answer).toContain('> opens at **eight**');
	});

	it('says search is not ready while its migration has not run', async () => {
		brain.matches = null;
		expect(await action('search_business_brain').run(nigelOnJewel, { organisationId: 'jewel', search: 'eight' })).toBe(searchNotReadyYet);
	});

	it('reads a page whole, with its facts, source, links, history and how to cite it', async () => {
		brain.history = { entries: [{ revisionId: 7, title: 'Office hours', revisedAt: '2026-11-01T09:00:00Z' }], revisionCount: 1 };
		const answer = await action('read_business_brain_page').run(nigelOnJewel, { organisationId: 'jewel', pageId });
		for (const part of ['# Opening hours', 'Eight to six.', '- opens: "08:00"', '**Staff handbook**', 'This page relates to **Fire door checks**', 'Revision 7: read as "Office hours"']) {
			expect(answer).toContain(part);
		}
		expect(answer).toContain(`Cite it as "Opening hours" (page id ${pageId}, from "Staff handbook")`);
	});

	it('answers plainly for a page or a revision the organisation does not have', async () => {
		expect(await action('read_business_brain_page').run(nigelOnJewel, { organisationId: 'jewel', pageId, revisionId: '3' })).toBe(noSuchRevision);
		brain.page = null;
		expect(await action('read_business_brain_page').run(nigelOnJewel, { organisationId: 'jewel', pageId })).toBe(noSuchPageToRead);
	});

	it('reads an earlier version, saying it is no longer how the page reads', async () => {
		brain.revision = { revisionId: 7, title: 'Office hours', revisedAt: '2026-11-01T09:00:00Z', kind: 'rule', summary: '', body: 'Nine to five.', source: null };
		const answer = await action('read_business_brain_page').run(nigelOnJewel, { organisationId: 'jewel', pageId, revisionId: '7' });
		expect(answer).toContain('# Office hours (earlier version)');
		expect(answer).toContain('It now reads as "Opening hours"');
	});
});
