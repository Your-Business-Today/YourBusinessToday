import { describe, expect, it } from 'vitest';
import { readPullRequestEvent } from './readPullRequestEvent';

const repository = { html_url: 'https://github.com/owner/repo' };
const pullRequest = { html_url: 'https://github.com/owner/repo/pull/7', head: { ref: 'fix/rounding' } };

describe('a pull request event from GitHub', () => {
	it('reads an opened pull request', () => {
		const event = { action: 'opened', pull_request: pullRequest, repository };
		expect(readPullRequestEvent(event)).toEqual({
			change: 'opened',
			branchName: 'fix/rounding',
			url: pullRequest.html_url,
			repositoryUrl: repository.html_url
		});
	});

	it('reads a merge, and ignores a pull request closed without one', () => {
		const merged = { action: 'closed', pull_request: { ...pullRequest, merged: true }, repository };
		const abandoned = { action: 'closed', pull_request: pullRequest, repository };
		expect(readPullRequestEvent(merged)?.change).toBe('merged');
		expect(readPullRequestEvent(abandoned)).toBeNull();
	});
});
