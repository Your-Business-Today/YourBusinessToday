import { describe, expect, it } from 'vitest';
import { noRepositoryRecorded, repositoryLine, repositoryPhrase } from './describeRepository';

const desktopApp = { repositoryUrl: 'https://github.com/jamesbeadle/ybt-app', defaultBranch: 'main' };
const noCode = { repositoryUrl: '', defaultBranch: 'main' };

describe('the code line of a project or task', () => {
	it('names the repository and the branch it deploys from, as a sentence', () => {
		expect(repositoryLine(desktopApp)).toBe('Code: https://github.com/jamesbeadle/ybt-app (deploys from main).');
	});

	it('says no repository is recorded when the project has none', () => {
		expect(repositoryLine(noCode)).toBe(`${noRepositoryRecorded}.`);
		expect(repositoryPhrase(noCode)).toBe(noRepositoryRecorded);
	});
});
