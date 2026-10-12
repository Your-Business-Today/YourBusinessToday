import { describe, expect, it } from 'vitest';
import { heartbeatSentence } from './heartbeatSentence';

describe('heartbeatSentence', () => {
	const today = new Date('2026-10-12T09:00:00Z');

	it('says the watchers never ran when there is no heartbeat', () => {
		expect(heartbeatSentence(null, today)).toBe('Watchers: never run');
	});

	it('says the time when the heartbeat ran today and the date when it did not', () => {
		expect(heartbeatSentence('2026-10-12T06:00:00Z', today)).toMatch(/^Watchers: heartbeat \d\d:\d\d today$/);
		expect(heartbeatSentence('2026-10-10T06:00:00Z', today)).toMatch(/^Watchers: heartbeat 10 Oct/);
	});
});
