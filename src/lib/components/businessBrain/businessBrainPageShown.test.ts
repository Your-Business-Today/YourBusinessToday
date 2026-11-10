import { describe, expect, it } from 'vitest';
import { pageAsShown } from './businessBrainPageShown';
import type { BusinessBrainPageRead } from '$lib/server/businessBrain/readBusinessBrainPageWhole';
import type { BusinessBrainRevisionRead } from '$lib/server/businessBrain/readBusinessBrainPageHistory';

const page: BusinessBrainPageRead = {
	pageId: 'page',
	partKind: 'process',
	parentPageId: null,
	kind: 'procedure',
	title: 'Quoting a job',
	summary: 'How a quote is priced',
	body: 'Price the labour first.',
	facts: { margin: '20%', steps: 4 },
	source: null,
	updatedAt: '2026-11-10T12:00:00Z'
};

const revision: BusinessBrainRevisionRead = {
	revisionId: 3,
	title: 'Quoting',
	revisedAt: '2026-11-09T12:00:00Z',
	kind: 'procedure',
	summary: 'Older summary',
	body: 'Price the materials first.',
	source: null
};

describe('pageAsShown', () => {
	it('shows the page as it now reads, with its facts, when no earlier version is asked for', () => {
		const shown = pageAsShown(page, null);
		expect(shown.body).toBe(page.body);
		expect(shown.revisedAt).toBeNull();
		expect(shown.facts).toEqual([
			{ name: 'margin', value: '20%' },
			{ name: 'steps', value: '4' }
		]);
	});

	it('shows the earlier version asked for, which kept no facts', () => {
		const shown = pageAsShown(page, revision);
		expect(shown.title).toBe(revision.title);
		expect(shown.body).toBe(revision.body);
		expect(shown.revisedAt).toBe(revision.revisedAt);
		expect(shown.facts).toEqual([]);
	});
});
