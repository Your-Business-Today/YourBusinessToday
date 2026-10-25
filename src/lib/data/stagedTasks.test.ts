import { describe, expect, it } from 'vitest';
import { describeStagingStanding, isStagedNotLive, stagedTasksOf } from './stagedTasks';

const notStaged = { id: 'open', stagedAt: null, liveAt: null };
const stagedEarly = { id: 'early', stagedAt: '2026-10-25T17:51:00+00:00', liveAt: null };
const stagedLate = { id: 'late', stagedAt: '2026-10-25T18:44:00+00:00', liveAt: null };
const live = { id: 'live', stagedAt: '2026-10-25T17:48:00+00:00', liveAt: '2026-10-25T18:14:00+00:00' };

describe('stagedTasksOf', () => {
	it('keeps the tasks merged into staging that no promotion has carried yet, latest merge first', () => {
		const staged = stagedTasksOf([notStaged, stagedEarly, live, stagedLate]);
		expect(staged.map((task) => task.id)).toEqual(['late', 'early']);
	});

	it('counts a task as staged only while its work is not live', () => {
		expect(isStagedNotLive(stagedEarly)).toBe(true);
		expect(isStagedNotLive(live)).toBe(false);
		expect(isStagedNotLive(notStaged)).toBe(false);
	});
});

describe('describeStagingStanding', () => {
	it('says a staged task deploys at the next promotion, a live one when it went live, and nothing otherwise', () => {
		expect(describeStagingStanding(stagedLate)).toMatch(/^Merged into staging on .+; deploys when staging is next promoted\.$/);
		expect(describeStagingStanding(live)).toMatch(/^Live since .+\.$/);
		expect(describeStagingStanding(notStaged)).toBe('');
	});
});
