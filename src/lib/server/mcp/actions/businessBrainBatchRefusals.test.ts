import './businessBrainBatchMocks';
import { beforeEach, describe, expect, it } from 'vitest';
import { brain, resetBrain } from './businessBrainBatchWorld';
import { filePages, filePagesGuidance, roofer, roofThread, scaffold } from './businessBrainBatchFixtures';
import { pageListRefusal } from '$lib/server/businessBrain/validateBusinessBrainPageList';

beforeEach(resetBrain);

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
