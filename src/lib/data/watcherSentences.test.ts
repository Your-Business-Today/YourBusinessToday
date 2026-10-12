import { describe, expect, it } from 'vitest';
import { lastRunSentence } from './watcherSentences';

describe('lastRunSentence', () => {
	const today = new Date('2026-10-12T09:00:00Z');

	it('uses the words for never when there is no run', () => {
		expect(lastRunSentence('Heartbeat', 'Watchers have not run yet', null, today)).toBe('Watchers have not run yet');
	});

	it('says the time when the run was today and the date when it was not', () => {
		expect(lastRunSentence('Heartbeat', 'never', '2026-10-12T06:00:00Z', today)).toMatch(/^Heartbeat \d\d:\d\d today$/);
		expect(lastRunSentence('Food premises swept', 'never', '2026-10-10T06:10:00Z', today)).toMatch(/^Food premises swept 10 Oct/);
	});
});
