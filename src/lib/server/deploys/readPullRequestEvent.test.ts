import { describe, expect, it } from 'vitest';
import { readPullRequestEvent } from './readPullRequestEvent';

const repository = { html_url: 'https://github.com/owner/repo' };
const pullRequest = { html_url: 'https://github.com/owner/repo/pull/7', head: { ref: 'fix/rounding' }, base: { ref: 'main' } };

describe('a pull request event from GitHub', () => {
	it('reads an opened pull request', () => {
		const event = { action: 'opened', pull_request: pullRequest, repository };
		expect(readPullRequestEvent(event)).toEqual({
			change: 'opened',
			branchName: 'fix/rounding',
			baseBranch: 'main',
			url: pullRequest.html_url,
			repositoryUrl: repository.html_url,
			mergeCommitSha: ''
		});
	});

	it('reads the commit a merge made, and nothing that is not a commit', () => {
		const mergeCommitSha = 'e'.repeat(40);
		const merged = { action: 'closed', pull_request: { ...pullRequest, merged: true, merge_commit_sha: mergeCommitSha }, repository };
		const garbled = { ...merged, pull_request: { ...merged.pull_request, merge_commit_sha: 'main' } };
		expect(readPullRequestEvent(merged)?.mergeCommitSha).toBe(mergeCommitSha);
		expect(readPullRequestEvent(garbled)?.mergeCommitSha).toBe('');
	});

	it('reads a merge, and ignores a pull request closed without one', () => {
		const merged = { action: 'closed', pull_request: { ...pullRequest, merged: true }, repository };
		const abandoned = { action: 'closed', pull_request: pullRequest, repository };
		expect(readPullRequestEvent(merged)?.change).toBe('merged');
		expect(readPullRequestEvent(abandoned)).toBeNull();
	});

	it('reads the branch a pull request merges into', () => {
		const intoStaging = { ...pullRequest, merged: true, base: { ref: 'staging' } };
		const event = { action: 'closed', pull_request: intoStaging, repository };
		expect(readPullRequestEvent(event)?.baseBranch).toBe('staging');
	});
});
