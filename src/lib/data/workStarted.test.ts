import { describe, expect, it } from 'vitest';
import { lifecycleSteps } from './lifecycleStep';
import { startsTheWork } from './workStarted';

describe('the steps that start the work', () => {
	it('starts the work once a task is being built, reviewed or has a pull request', () => {
		expect(startsTheWork(lifecycleSteps.building)).toBe(true);
		expect(startsTheWork(lifecycleSteps.built)).toBe(true);
		expect(startsTheWork(lifecycleSteps.reviewing)).toBe(true);
		expect(startsTheWork(lifecycleSteps.pullRequestOpen)).toBe(true);
	});

	it('leaves a task where it is while it is only being looked at, given up or merged', () => {
		expect(startsTheWork(lifecycleSteps.considering)).toBe(false);
		expect(startsTheWork(lifecycleSteps.considered)).toBe(false);
		expect(startsTheWork(lifecycleSteps.released)).toBe(false);
		expect(startsTheWork(lifecycleSteps.merged)).toBe(false);
	});
});
