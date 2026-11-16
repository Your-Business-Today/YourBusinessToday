import { describe, expect, it } from 'vitest';
import { noRepositoryRecorded, repositoryLine } from './describeRepository';

const desktopApp = { repositoryUrl: 'https://github.com/jamesbeadle/ybt-app', defaultBranch: 'main', deployStagingAt: null };
const noCode = { repositoryUrl: '', defaultBranch: 'main', deployStagingAt: null };
const portal = { repositoryUrl: 'https://github.com/example/portal', defaultBranch: 'main', deployStagingAt: '00:00' };

describe('the code line of a project or task', () => {
	it('names the repository and the branch it deploys from, as a sentence', () => {
		expect(repositoryLine(desktopApp)).toBe('Code: https://github.com/jamesbeadle/ybt-app (deploys from main).');
	});

	it('says no repository is recorded when the project has none', () => {
		expect(repositoryLine(noCode)).toBe(`${noRepositoryRecorded}.`);
	});
});

describe('the code line of a project with a deploy window', () => {
	it('says pull requests go into staging, and how a clone that holds main alone fetches it', () => {
		expect(repositoryLine(portal)).toBe(
			'Code: https://github.com/example/portal (deploys from main). ' +
				'Pull requests go into staging, never into main: main moves only when staging is promoted, at 00:00 UK time. ' +
				'The one exception is a fix the person asks for by name as urgent. ' +
				'A cloud session’s clone may hold main alone, so git branch -r proves nothing: ' +
				'fetch staging by name (git fetch origin +refs/heads/staging:refs/remotes/origin/staging) and branch from origin/staging.'
		);
	});

	it('names the project’s own default branch as the one that takes no pull requests', () => {
		const onTrunk = { ...portal, defaultBranch: 'trunk' };
		expect(repositoryLine(onTrunk)).toContain('Pull requests go into staging, never into trunk: trunk moves only when');
		expect(repositoryLine(onTrunk)).toContain('may hold trunk alone');
	});

	it('says nothing of staging when the project deploys from staging itself', () => {
		const deploysFromStaging = { ...portal, defaultBranch: 'staging' };
		expect(repositoryLine(deploysFromStaging)).toBe('Code: https://github.com/example/portal (deploys from staging).');
	});

	it('says nothing of staging when no repository is recorded', () => {
		expect(repositoryLine({ ...noCode, deployStagingAt: '00:00' })).toBe(`${noRepositoryRecorded}.`);
	});
});
