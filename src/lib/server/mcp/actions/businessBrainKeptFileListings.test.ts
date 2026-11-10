import { beforeEach, describe, expect, it, vi } from 'vitest';
import { brainAction as action, nigelOnJewel, openingHours, pageId, staffHandbook } from './businessBrainReadingFixtures';
import { handbookFileId, handbookPdf, sitePhoto } from './businessBrainKeptFileFixtures';

const brain = vi.hoisted(() => ({
	pageFiles: [] as unknown[],
	kept: { keptCount: 0, unnamed: [] as unknown[], unnamedCount: 0 }
}));

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async () => ({ id: 'jewel', parentOrganisationId: null, name: 'Jewel Enterprises' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['business_brain'] }));
vi.mock('$lib/server/businessBrain/readBusinessBrainIndex', () => ({ readBusinessBrainIndex: async () => ({ entries: [openingHours], pageCount: 1 }) }));
vi.mock('$lib/server/businessBrain/readBusinessBrainPageWhole', () => ({
	readBusinessBrainPageWhole: async () => ({ ...openingHours, parentPageId: null, body: 'Eight to six.', facts: {}, source: staffHandbook })
}));
vi.mock('$lib/server/businessBrain/readBusinessBrainPageLinks', () => ({ readBusinessBrainPageLinks: async () => [], readPageTitles: async () => new Map() }));
vi.mock('$lib/server/businessBrain/readBusinessBrainPageHistory', () => ({
	readBusinessBrainPageHistory: async () => ({ entries: [], revisionCount: 0 }),
	readBusinessBrainRevision: async () => null
}));
vi.mock('$lib/server/businessBrain/readKeptBusinessBrainFiles', () => ({
	readFilesNamedByPage: async () => brain.pageFiles,
	readKeptBusinessBrainFiles: async () => brain.kept
}));

const readPage = () => action('read_business_brain_page').run(nigelOnJewel, { organisationId: 'jewel', pageId });
const readIndex = () => action('read_business_brain_index').run(nigelOnJewel, { organisationId: 'jewel' });

describe('reading Your Business Brain tells of the files it keeps', () => {
	beforeEach(() => {
		brain.pageFiles = [];
		brain.kept = { keptCount: 0, unnamed: [], unnamedCount: 0 };
	});

	it('lists the files a page names, with their name, type, size and id', async () => {
		brain.pageFiles = [handbookPdf];
		const answer = await readPage();
		expect(answer).toContain('## Source files: one file');
		expect(answer).toContain(`- **staff-handbook-2026.pdf** (application/pdf, 2 KB, file id ${handbookFileId})`);
		expect(answer).toContain('Open one with open_business_brain_file');
	});

	it('says nothing of files on a page that names none', async () => {
		expect(await readPage()).not.toContain('Source files');
	});

	it('says in the index how many files are kept, and lists those no page names', async () => {
		brain.kept = { keptCount: 3, unnamed: [sitePhoto], unnamedCount: 1 };
		const answer = await readIndex();
		expect(answer).toContain('## Kept files: 3 files');
		expect(answer).toContain('one file no page names yet');
		expect(answer).toContain(`- **site-board.jpg** (image/jpeg, 2 KB, file id ${sitePhoto.fileId})`);
	});

	it('says how many unnamed files are not listed', async () => {
		brain.kept = { keptCount: 60, unnamed: [sitePhoto], unnamedCount: 4 };
		expect(await readIndex()).toContain('3 more unnamed files not listed.');
	});

	it('says every kept file is on the page written from it when none is unnamed', async () => {
		brain.kept = { keptCount: 2, unnamed: [], unnamedCount: 0 };
		const answer = await readIndex();
		expect(answer).toContain('## Kept files: 2 files');
		expect(answer).toContain('Each is listed on the page written from it.');
	});

	it('says nothing of files when the brain keeps none', async () => {
		expect(await readIndex()).not.toContain('Kept files');
	});
});
