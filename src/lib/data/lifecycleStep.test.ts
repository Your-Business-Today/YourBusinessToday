import { describe, expect, it } from 'vitest';
import { hasLeftTheBuildQueue, lifecycleSteps } from './lifecycleStep';

describe('leaving the build queue', () => {
	it('keeps a task in the queue while it is only being considered or built', () => {
		expect(hasLeftTheBuildQueue(lifecycleSteps.considering)).toBe(false);
		expect(hasLeftTheBuildQueue(lifecycleSteps.considered)).toBe(false);
		expect(hasLeftTheBuildQueue(lifecycleSteps.building)).toBe(false);
	});

	it('takes a task out of the queue once a reviewer or a pull request carries it', () => {
		expect(hasLeftTheBuildQueue(lifecycleSteps.built)).toBe(true);
		expect(hasLeftTheBuildQueue(lifecycleSteps.reviewing)).toBe(true);
		expect(hasLeftTheBuildQueue(lifecycleSteps.pullRequestOpen)).toBe(true);
	});

	it('returns a released task to the queue', () => {
		expect(hasLeftTheBuildQueue(lifecycleSteps.released)).toBe(false);
	});
});
