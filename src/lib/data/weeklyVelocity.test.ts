import { describe, expect, it } from 'vitest';
import { weekLabelOf, weeklyVelocityOf } from './weeklyVelocity';

const wednesdayAfternoon = new Date('2026-11-11T15:00:00Z');

describe('the weekly velocity', () => {
	it('adds the points that went live in each of the last six UK weeks, this week last', () => {
		const velocity = weeklyVelocityOf(
			[
				{ liveAt: '2026-11-10T01:00:00Z', storyPoints: 5 },
				{ liveAt: '2026-11-10T01:00:00Z', storyPoints: 3 },
				{ liveAt: '2026-11-02T08:00:00Z', storyPoints: 2 },
				{ liveAt: '2026-10-05T08:00:00Z', storyPoints: 13 },
				{ liveAt: null, storyPoints: 8 }
			],
			wednesdayAfternoon
		);
		expect(velocity.weeks.map((week) => week.weekStart)).toEqual([
			'2026-10-05',
			'2026-10-12',
			'2026-10-19',
			'2026-10-26',
			'2026-11-02',
			'2026-11-09'
		]);
		expect(velocity.weeks.map((week) => week.points)).toEqual([13, 0, 0, 0, 2, 8]);
		expect(velocity.averagePoints).toBe(3.8);
	});

	it('counts a deploy just after midnight on a UK Monday in the week it starts', () => {
		const summerMondayJustAfterMidnight = '2026-06-28T23:30:00Z';
		const velocity = weeklyVelocityOf([{ liveAt: summerMondayJustAfterMidnight, storyPoints: 5 }], new Date('2026-07-01T12:00:00Z'));
		expect(velocity.weeks.at(-1)).toEqual({ weekStart: '2026-06-29', points: 5 });
	});

	it('leaves out work that went live before the six weeks', () => {
		const velocity = weeklyVelocityOf([{ liveAt: '2026-09-01T08:00:00Z', storyPoints: 21 }], wednesdayAfternoon);
		expect(velocity.averagePoints).toBe(0);
	});

	it('names a week by the Monday it starts on', () => {
		expect(weekLabelOf('2026-11-09')).toBe('9 Nov');
	});
});
