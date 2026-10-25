import { describe, expect, it } from 'vitest';
import { isDeployWindowDue } from './deployWindowRule';

const clock = { date: '2026-10-25', time: '18:07' };
const dueReading = { deployTime: '18:00', clock, lastWindowDate: '2026-10-24', wasLastWindowFailed: false };

describe('isDeployWindowDue', () => {
	it('is due once the deploy time has passed today and today has not run', () => {
		expect(isDeployWindowDue(dueReading)).toBe(true);
		expect(isDeployWindowDue({ ...dueReading, lastWindowDate: null })).toBe(true);
		expect(isDeployWindowDue({ ...dueReading, deployTime: '18:07' })).toBe(true);
	});

	it('is not due before the time, with no time set, or once today has run', () => {
		expect(isDeployWindowDue({ ...dueReading, deployTime: '18:08' })).toBe(false);
		expect(isDeployWindowDue({ ...dueReading, deployTime: null })).toBe(false);
		expect(isDeployWindowDue({ ...dueReading, lastWindowDate: '2026-10-25' })).toBe(false);
	});

	it('is tried again today when today’s window failed', () => {
		expect(isDeployWindowDue({ ...dueReading, lastWindowDate: '2026-10-25', wasLastWindowFailed: true })).toBe(true);
	});
});
