import { describe, expect, it } from 'vitest';
import { mergedPullRequestsOf } from './mergedPullRequests';

describe('mergedPullRequestsOf', () => {
	it('reads a merge commit’s pull request number and branch', () => {
		const commits = [{ message: 'Merge pull request #195 from Your-Business-Today/fix/vercel-skips-staging-build\n\nSkip the build' }];
		expect(mergedPullRequestsOf(commits)).toEqual([{ number: 195, branchName: 'fix/vercel-skips-staging-build' }]);
	});

	it('reads a squashed merge’s pull request number from its title, with no branch', () => {
		const commits = [{ message: 'Round the invoice total once (#42)\n\nDetails' }];
		expect(mergedPullRequestsOf(commits)).toEqual([{ number: 42, branchName: '' }]);
	});

	it('skips the ordinary commits on a branch and names each pull request once', () => {
		const commits = [
			{ message: 'Merge pull request #7 from owner/feature/grid' },
			{ message: 'Draw the grid' },
			{ message: 'Merge pull request #7 from owner/feature/grid' }
		];
		expect(mergedPullRequestsOf(commits)).toEqual([{ number: 7, branchName: 'feature/grid' }]);
	});
});
