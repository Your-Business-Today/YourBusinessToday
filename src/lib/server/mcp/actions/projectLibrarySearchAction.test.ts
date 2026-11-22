import { beforeEach, describe, expect, it, vi } from 'vitest';
import { librarySearchNotReadyYet } from './describeLibraryMatches';
import { searchProjectLibraryAction } from './projectLibrarySearchAction';
import type { LibraryMatch } from '$lib/projectLibrary/libraryMatch';
import type { McpCaller } from '../resolveMcpCaller';

const harbourId = '11111111-1111-4111-8111-111111111111';
const videoId = '22222222-2222-4222-8222-222222222222';
const documentId = '33333333-3333-4333-8333-333333333333';
const harbour = { id: harbourId, name: 'Harbour' };
const uploadingReports: LibraryMatch = {
	kind: 'video', id: videoId, projectId: harbourId, title: 'Uploading a monthly report', summary: '', section: 'Imports', library: 'tutorials',
	excerpt: [{ words: 'send the ', isMatch: false }, { words: 'reports', isMatch: true }]
};
const howItWorks: LibraryMatch = {
	kind: 'document', id: documentId, projectId: harbourId, title: 'How it works', summary: 'The guide', section: 'How it works', library: null, excerpt: []
};
const world = { matches: [] as LibraryMatch[] | null, searched: [] as string[] };

vi.mock('../projectAccess', () => ({
	noReachableProject: 'No project you are on has that id.',
	reachableProject: async (_caller: unknown, projectId: string) => (projectId === harbourId ? harbour : null)
}));
vi.mock('$lib/server/projectLibrary/searchProjectLibrary', () => ({
	searchProjectLibrary: async (_supabase: unknown, _projectId: string, words: string) => {
		world.searched.push(words);
		return world.matches;
	}
}));

const nigel = { accountId: 'nigel' } as unknown as McpCaller;

function search(input: Record<string, unknown>): Promise<string> {
	return searchProjectLibraryAction.run(nigel, { projectId: harbourId, ...input }).then(String);
}

describe('searching a project’s videos and documents over the connector', () => {
	beforeEach(() => Object.assign(world, { matches: [uploadingReports, howItWorks], searched: [] }));

	it('gives the matches best first, each with its id and where it opens on the site', async () => {
		const answer = await search({ words: '  reports ' });
		expect(world.searched).toEqual(['reports']);
		expect(answer).toContain(`Video: Uploading a monthly report (Imports, tutorials library, video id: ${videoId})`);
		expect(answer).toContain(`/projects/${harbourId}/videos?watch=${videoId}`);
		expect(answer).toContain('send the **reports**');
		expect(answer).toContain(`Document: How it works (How it works, document id: ${documentId}), at https://yourbusiness.today/projects/${harbourId}/documents/${documentId}`);
		expect(answer.indexOf('Uploading')).toBeLessThan(answer.indexOf('How it works ('));
	});

	it('says plainly when nothing matches', async () => {
		world.matches = [];
		expect(await search({ words: 'payroll' })).toContain(`Nothing in Harbour's videos or documents matches "payroll"`);
	});

	it('refuses words that are missing or too long by name, and a project the person is not on', async () => {
		expect(await search({ words: '   ' })).toContain('Not searched: words are what to look for');
		expect(await search({ words: 'x'.repeat(201) })).toContain('at most 200 characters');
		expect(await search({ words: 'reports', projectId: videoId })).toContain('No project you are on');
		expect(world.searched).toEqual([]);
	});

	it('says the search is not ready while its migration has not run', async () => {
		world.matches = null;
		expect(await search({ words: 'reports' })).toBe(librarySearchNotReadyYet);
	});
});
