import { describe, expect, it, vi } from 'vitest';
import { deployedCommitHeaders } from './deployedCommit';

const env = vi.hoisted((): Record<string, string | undefined> => ({}));

vi.mock('$env/dynamic/private', () => ({ env }));

describe("the watch door's deployed commit", () => {
	it('names the commit Vercel built the deployment from', () => {
		env.VERCEL_GIT_COMMIT_SHA = '3edf867aa';
		expect(deployedCommitHeaders()).toEqual({ 'x-deployed-commit': '3edf867aa' });
	});

	it('names nothing where the commit is not known, as on a local run', () => {
		delete env.VERCEL_GIT_COMMIT_SHA;
		expect(deployedCommitHeaders()).toEqual({});
	});
});
