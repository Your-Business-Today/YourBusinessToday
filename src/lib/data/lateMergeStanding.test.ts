import { describe, expect, it } from 'vitest';
import { describeLateMerge } from './lateMergeStanding';

const defaultBranch = 'main';

describe('a pull request recorded after it merged', () => {
	it('says the task is staged when the merge went into staging and no promotion has carried it', () => {
		const sentence = describeLateMerge({ isStaged: true, isLive: false, defaultBranch });
		expect(sentence).toBe(' Its pull request had already merged into staging, so the task is done and deploys at the next promotion.');
	});

	it('says the work is live when a promotion has since carried the staged merge', () => {
		const sentence = describeLateMerge({ isStaged: true, isLive: true, defaultBranch });
		expect(sentence).toContain('promoted');
		expect(sentence).toContain('live');
	});

	it('names the default branch when the merge went straight into it', () => {
		const sentence = describeLateMerge({ isStaged: false, isLive: false, defaultBranch });
		expect(sentence).toBe(' Its pull request had already merged into main, so that is recorded.');
	});
});
