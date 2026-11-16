import { describe, expect, it } from 'vitest';
import { isSamePullRequest, isTakingPullRequest } from './pullRequestOwnership';
import { taskStatuses } from './taskStatus';

const firstPullRequest = 'https://github.com/Example/ybt/pull/574';
const secondPullRequest = 'https://github.com/example/ybt/pull/575';

describe('isTakingPullRequest', () => {
	it('gives a pull request to every open task on its branch, whatever it recorded before', () => {
		expect(isTakingPullRequest({ status: taskStatuses.backlog, pullRequestUrl: '' }, secondPullRequest)).toBe(true);
		expect(isTakingPullRequest({ status: taskStatuses.inProgress, pullRequestUrl: firstPullRequest }, secondPullRequest)).toBe(true);
	});

	it('leaves a task finished by another pull request on the same branch alone', () => {
		expect(isTakingPullRequest({ status: taskStatuses.done, pullRequestUrl: firstPullRequest }, secondPullRequest)).toBe(false);
	});

	it('leaves a finished task with no pull request recorded alone', () => {
		expect(isTakingPullRequest({ status: taskStatuses.done, pullRequestUrl: '' }, secondPullRequest)).toBe(false);
	});

	it('still records a finished task’s own pull request, so a repeated delivery lands where it did', () => {
		const ownPullRequest = 'https://github.com/example/ybt/pull/574/';
		expect(isTakingPullRequest({ status: taskStatuses.done, pullRequestUrl: firstPullRequest }, ownPullRequest)).toBe(true);
	});
});

describe('isSamePullRequest', () => {
	it('tells pull requests apart by repository and number', () => {
		expect(isSamePullRequest(firstPullRequest, 'https://github.com/example/other/pull/574')).toBe(false);
		expect(isSamePullRequest(firstPullRequest, secondPullRequest)).toBe(false);
		expect(isSamePullRequest('', firstPullRequest)).toBe(false);
	});
});
