import { beforeEach, describe, expect, it, vi } from 'vitest';
import { promoteStaging } from './promoteStaging';
import { mergeabilities, type Mergeability } from '$lib/server/github/pullRequestMergeability';
import { deployWindowOutcomes } from '$lib/data/deployWindow';
import { timedWindowStart } from '$lib/data/deployStart';
import type { BranchComparison } from '$lib/server/github/compareBranches';
import type { PullRequest } from '$lib/server/github/pullRequests';
import type { Project } from '$lib/server/projects/projectRecord';

const promotion = vi.hoisted((): PullRequest => ({ number: 12, nodeId: 'PR_12', url: 'https://github.com/example/portal/pull/12' }));
const github = vi.hoisted(() => ({
	comparison: null as BranchComparison | null,
	leftOpen: null as PullRequest | null,
	mergeability: null as Mergeability | null,
	asked: [] as string[]
}));

vi.mock('$lib/server/github/compareBranches', () => ({ compareBranches: async () => github.comparison }));
vi.mock('$lib/server/github/enableAutoMerge', () => ({ enableAutoMerge: async () => void github.asked.push('to merge itself') }));
vi.mock('$lib/server/github/pullRequests', () => ({
	findOpenPullRequest: async () => github.leftOpen,
	mergePullRequest: async () => void github.asked.push('to merge at once'),
	openPullRequest: async () => {
		github.asked.push('to open it');
		return promotion;
	},
	rewritePullRequestBody: async () => void github.asked.push('to rewrite its body')
}));
vi.mock('$lib/server/github/pullRequestMergeability', async (importOriginal) => ({
	...(await importOriginal<object>()),
	settledMergeability: async () => {
		github.asked.push('whether it can merge');
		return github.mergeability;
	}
}));

const portal = { repositoryUrl: 'https://github.com/example/portal', defaultBranch: 'main', deployStagingAt: '00:00' } as Project;
const midnight = { date: '2026-11-16', time: '00:01' };
const request = { start: timedWindowStart, tasks: [] };
const stagingAhead: BranchComparison = { aheadBy: 3, commits: [], hasTheSameFiles: false };

describe('promoting staging when GitHub says whether the pull request can be merged', () => {
	beforeEach(() => Object.assign(github, { comparison: stagingAhead, leftOpen: null, mergeability: mergeabilities.mergeable, asked: [] }));

	it('opens the pull request and asks for it to merge itself when the two branches merge cleanly', async () => {
		const promoted = await promoteStaging(portal, midnight, request);
		expect(promoted).toMatchObject({ outcome: deployWindowOutcomes.opened, pullRequestUrl: promotion.url, hasConflict: false });
		expect(promoted.note).toBe('Merges itself once its checks pass.');
		expect(github.asked).toEqual(['to open it', 'whether it can merge', 'to merge itself']);
	});

	it('fails, keeps the pull request’s address and says what puts it right when the two branches conflict', async () => {
		github.mergeability = mergeabilities.conflicting;
		const promoted = await promoteStaging(portal, midnight, request);
		expect(promoted).toMatchObject({ outcome: deployWindowOutcomes.failed, pullRequestUrl: promotion.url, hasConflict: true });
		expect(promoted.note).toContain('staging conflicts with main');
		expect(promoted.note).toContain('Merge main into a branch cut from staging');
	});

	it('never asks a conflicting pull request to merge itself', async () => {
		github.mergeability = mergeabilities.conflicting;
		await promoteStaging(portal, midnight, request);
		expect(github.asked).toEqual(['to open it', 'whether it can merge']);
	});

	it('finds the conflict on a pull request left open from an earlier window too', async () => {
		Object.assign(github, { leftOpen: promotion, mergeability: mergeabilities.conflicting });
		const promoted = await promoteStaging(portal, midnight, request);
		expect(promoted).toMatchObject({ outcome: deployWindowOutcomes.failed, pullRequestUrl: promotion.url, hasConflict: true });
		expect(github.asked).toEqual(['to rewrite its body', 'whether it can merge']);
	});

	it('goes ahead and says so when GitHub has not yet worked out whether it can be merged', async () => {
		github.mergeability = mergeabilities.notYetKnown;
		const promoted = await promoteStaging(portal, midnight, request);
		expect(promoted).toMatchObject({ outcome: deployWindowOutcomes.opened, hasConflict: false });
		expect(promoted.note).toBe('Merges itself once its checks pass. GitHub had not yet said whether it can be merged.');
		expect(github.asked).toEqual(['to open it', 'whether it can merge', 'to merge itself']);
	});

	it('promotes nothing, and asks GitHub nothing more, when the default branch already holds every file', async () => {
		github.comparison = { ...stagingAhead, aheadBy: 0, hasTheSameFiles: true };
		const promoted = await promoteStaging(portal, midnight, request);
		expect(promoted).toMatchObject({ outcome: deployWindowOutcomes.nothingToPromote, hasConflict: false });
		expect(github.asked).toEqual([]);
	});
});
