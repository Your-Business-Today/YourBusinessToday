import { describe, expect, it } from 'vitest';
import { pullRequestAddressOf } from './pullRequestAddress';

describe('a pull request address on GitHub', () => {
	it('names the repository and the number', () => {
		expect(pullRequestAddressOf('https://github.com/Your-Business-Today/YourBusinessToday/pull/203')).toEqual({
			repositoryUrl: 'https://github.com/Your-Business-Today/YourBusinessToday',
			number: 203
		});
	});

	it('allows a trailing slash and surrounding space', () => {
		expect(pullRequestAddressOf(' https://github.com/owner/repo/pull/7/ ')?.number).toBe(7);
	});

	it('is null for anything that is not a pull request on GitHub', () => {
		expect(pullRequestAddressOf('https://github.com/owner/repo')).toBeNull();
		expect(pullRequestAddressOf('https://github.com/owner/repo/issues/7')).toBeNull();
		expect(pullRequestAddressOf('https://gitlab.com/owner/repo/-/merge_requests/7')).toBeNull();
		expect(pullRequestAddressOf('')).toBeNull();
	});
});
