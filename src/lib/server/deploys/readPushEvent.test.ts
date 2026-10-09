import { describe, expect, it } from 'vitest';
import { readPushEvent } from './readPushEvent';

const receivedAt = new Date('2026-09-15T16:00:00.000Z');

const pushToMain = {
	ref: 'refs/heads/main',
	after: 'c428de0f',
	deleted: false,
	repository: { html_url: 'https://github.com/jamesbeadle/jewel-portal' },
	head_commit: { timestamp: '2026-09-15T15:58:12+01:00' },
	commits: [
		{ added: ['migrations/0074_database_tasks.sql', 'src/a.ts'] },
		{ added: ['migrations/0074_database_tasks.sql'] }
	]
};

describe('readPushEvent', () => {
	it('reads the branch, the commit and the time of a push', () => {
		expect(readPushEvent(pushToMain, receivedAt)).toEqual({
			repositoryUrl: 'https://github.com/jamesbeadle/jewel-portal',
			branch: 'main',
			commitSha: 'c428de0f',
			pushedAt: '2026-09-15T15:58:12+01:00',
			addedFiles: ['migrations/0074_database_tasks.sql', 'src/a.ts']
		});
	});

	it('reads no added files from a push that lists no commits', () => {
		expect(readPushEvent({ ...pushToMain, commits: undefined }, receivedAt)?.addedFiles).toEqual([]);
	});

	it('falls back to the time it arrived when the push carries no head commit', () => {
		const deploy = readPushEvent({ ...pushToMain, head_commit: null }, receivedAt);
		expect(deploy?.pushedAt).toBe('2026-09-15T16:00:00.000Z');
	});

	it('ignores a tag push, a deleted branch and an event with no repository', () => {
		expect(readPushEvent({ ...pushToMain, ref: 'refs/tags/v1' }, receivedAt)).toBeNull();
		expect(readPushEvent({ ...pushToMain, deleted: true }, receivedAt)).toBeNull();
		expect(readPushEvent({ ...pushToMain, repository: {} }, receivedAt)).toBeNull();
		expect(readPushEvent({}, receivedAt)).toBeNull();
	});
});
