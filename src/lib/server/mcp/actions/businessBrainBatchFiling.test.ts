import './businessBrainBatchMocks';
import { beforeEach, describe, expect, it } from 'vitest';
import { brain, newSourcesKept, resetBrain } from './businessBrainBatchWorld';
import { filePages, roofer, roofThread, scaffold } from './businessBrainBatchFixtures';

beforeEach(resetBrain);

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
