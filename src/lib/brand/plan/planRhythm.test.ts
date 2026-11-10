import { describe, expect, it } from 'vitest';
import { contentPlanOf } from './contentPlanOf';
import { planRowsOf } from './planRows';
import type { PlannedPiece } from '../content/contentPiece';
import type { PostingRhythm } from '../rhythm/postingRhythm';

const november = { year: 2026, month: 11 };
const days: PostingRhythm['days'] = ['Monday', 'Wednesday', 'Thursday'];
const everywhere: PostingRhythm = { mediumPath: 'all', medium: 'Everywhere', days, time: '19:30', postsAWeek: 3 };
const linkedIn: PostingRhythm = { mediumPath: 'text.post.linkedin', medium: 'LinkedIn post', days, time: '19:30', postsAWeek: 1 };

function piece(id: string, plannedFor: string, mediumPath = 'image.post.instagram'): PlannedPiece {
	return { id, postId: id, mediumPath, kind: 'tip', title: `Post ${id}`, hook: '', caption: '', stage: 'idea', plannedFor, scheduledFor: null, updatedAt: '' };
}

const weekOfTheSecond = [
	piece('mon', '2026-11-02T19:30:00Z'),
	piece('sat', '2026-11-07T19:30:00Z'),
	piece('linkedin', '2026-11-04T19:30:00Z', 'text.post.linkedin')
];

describe('the month’s plan against the posting rhythm', () => {
	it('counts each week’s posts against the number due, each post towards the rhythm decided nearest it', () => {
		const [, week] = contentPlanOf(november, weekOfTheSecond, [everywhere, linkedIn]).weeks;
		expect(week.tallies).toEqual([
			{ mediumPath: 'all', medium: 'Everywhere', count: 1, due: 3, extra: 1, isShort: true },
			{ mediumPath: 'text.post.linkedin', medium: 'LinkedIn post', count: 1, due: 1, extra: 0, isShort: false }
		]);
	});

	it('marks the posting days of a short week that have nothing on them, and keeps a post off the rhythm as extra', () => {
		const [, week] = contentPlanOf(november, weekOfTheSecond, [everywhere, linkedIn]).weeks;
		const awaited = week.days.map((day) => [day.date, day.awaitedOn]).filter(([, awaitedOn]) => awaitedOn.length > 0);
		expect(awaited).toEqual([
			['2026-11-04', ['Everywhere']],
			['2026-11-05', ['Everywhere']]
		]);
		const entries = week.days.flatMap((day) => day.entries);
		expect(entries.filter((entry) => entry.isExtra).map((entry) => entry.id)).toEqual(['sat']);
	});

	it('puts a line for a post due under a day that has others on it, and on an empty day in its place', () => {
		const [, week] = contentPlanOf(november, weekOfTheSecond, [everywhere, linkedIn]).weeks;
		const rows = planRowsOf(week).filter((row) => row.dueFor !== null);
		expect(rows).toEqual([
			{ key: '2026-11-04-due', dayLabel: '', post: null, dueFor: 'Everywhere' },
			{ key: '2026-11-05', dayLabel: 'Thu 5 Nov', post: null, dueFor: 'Everywhere' }
		]);
	});

	it('is due fewer in a week the month cuts short, and nothing in one with no posting day', () => {
		const [sundayFirst, , , , , lastMonday] = contentPlanOf(november, [], [everywhere]).weeks;
		expect(sundayFirst.tallies[0]).toMatchObject({ due: 0, isShort: false });
		expect(lastMonday.tallies[0]).toMatchObject({ due: 1, isShort: true });
		const withoutDays = { ...everywhere, days: null };
		const [, fullWeek] = contentPlanOf(november, [], [withoutDays]).weeks;
		expect(fullWeek.tallies[0]).toMatchObject({ due: 3, isShort: true });
		expect(fullWeek.days.flatMap((day) => day.awaitedOn)).toEqual([]);
	});

	it('shows nothing against a rhythm while the kit has none', () => {
		const [, week] = contentPlanOf(november, weekOfTheSecond).weeks;
		expect(week.tallies).toEqual([]);
		expect(week.days.flatMap((day) => day.entries).some((entry) => entry.isExtra)).toBe(false);
	});
});
