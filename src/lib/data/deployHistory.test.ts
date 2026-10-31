import { describe, expect, it } from 'vitest';
import { deployHistoryOf } from './deployHistory';

const lastNight = '2026-10-31T00:00:12+00:00';
const nightBefore = '2026-10-30T00:00:09+00:00';
const staged = { id: 'staged', stagedAt: '2026-10-31T15:00:00+00:00', liveAt: null };
const first = { id: 'first', stagedAt: '2026-10-30T15:00:00+00:00', liveAt: lastNight };
const second = { id: 'second', stagedAt: '2026-10-30T16:00:00+00:00', liveAt: lastNight };
const older = { id: 'older', stagedAt: '2026-10-29T16:00:00+00:00', liveAt: nightBefore };

describe('deployHistoryOf', () => {
	it('groups the tasks that went live together, newest deploy first, leaving out work not live yet', () => {
		const deploys = deployHistoryOf([older, staged, first, second]);
		expect(deploys.map((deploy) => deploy.liveAt)).toEqual([lastNight, nightBefore]);
		expect(deploys[0].tasks.map((task) => task.id)).toEqual(['first', 'second']);
	});

	it('keeps only as many deploys as asked for', () => {
		expect(deployHistoryOf([older, first], 1).map((deploy) => deploy.liveAt)).toEqual([lastNight]);
	});
});
