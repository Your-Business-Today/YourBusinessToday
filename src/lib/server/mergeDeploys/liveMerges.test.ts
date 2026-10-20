import { describe, expect, it } from 'vitest';
import { liveMerges } from './liveMerges';
import type { CheckState, CommitCheck } from './commitCheck';
import type { MergeDeploy } from './mergeDeploy';

const firstCommit = 'a'.repeat(40);
const secondCommit = 'b'.repeat(40);

function merge(commitSha: string, mergedAt: string, liveAt: string | null = null): MergeDeploy {
	return { id: commitSha, taskId: `task-${commitSha}`, projectId: 'project', commitSha, pullRequestUrl: '', mergedAt, liveAt };
}

function check(commitSha: string, checkName: string, state: CheckState): CommitCheck {
	return { commitSha, checkName, state, runUrl: '' };
}

const first = merge(firstCommit, '2026-10-20T10:00:00Z');
const second = merge(secondCommit, '2026-10-20T11:00:00Z');

describe('which merges are live', () => {
	it('is a merge whose every check on its commit has passed', () => {
		const checks = [check(firstCommit, 'ci', 'passed'), check(firstCommit, 'Production deploy', 'passed')];
		expect(liveMerges([first], checks)).toEqual([first]);
	});

	it('is not a merge with a check still running or failed', () => {
		const running = [check(firstCommit, 'ci', 'passed'), check(firstCommit, 'Production deploy', 'running')];
		const failed = [check(firstCommit, 'ci', 'failed')];
		expect(liveMerges([first], running)).toEqual([]);
		expect(liveMerges([first], failed)).toEqual([]);
	});

	it('is a merge whose failed check passed on a later merge, which deployed it too', () => {
		const checks = [check(firstCommit, 'ci', 'failed'), check(secondCommit, 'ci', 'passed')];
		expect(liveMerges([first, second], checks)).toEqual([second, first]);
	});

	it('is not a later merge because an earlier one passed', () => {
		const checks = [check(firstCommit, 'ci', 'passed'), check(secondCommit, 'ci', 'failed')];
		expect(liveMerges([first, second], checks)).toEqual([first]);
	});

	it('is a merge that started no checks once a later merge is live, and not before', () => {
		expect(liveMerges([first, second], [check(secondCommit, 'ci', 'passed')])).toEqual([second, first]);
		expect(liveMerges([first], [])).toEqual([]);
	});

	it('leaves out a merge already live', () => {
		const alreadyLive = merge(firstCommit, '2026-10-20T10:00:00Z', '2026-10-20T10:05:00Z');
		expect(liveMerges([alreadyLive], [check(firstCommit, 'ci', 'passed')])).toEqual([]);
	});
});
