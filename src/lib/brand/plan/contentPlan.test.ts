import { describe, expect, it } from 'vitest';
import { contentPlanOf } from './contentPlanOf';
import { planRowsOf } from './planRows';
import type { PlannedPiece } from '../content/contentPiece';

const november = { year: 2026, month: 11 };

function piece(id: string, stage: PlannedPiece['stage'], plannedFor: string | null, scheduledFor: string | null = null): PlannedPiece {
	const kind = 'tip';
	const words = { title: `Post ${id}`, hook: 'Hear that?', caption: '' };
	return { id, postId: id, mediumPath: 'image.post.facebook', kind, ...words, stage, plannedFor, scheduledFor, updatedAt: '' };
}

describe('the month’s plan', () => {
	it('lays the month out week by week from Monday, the short weeks at the ends kept', () => {
		const plan = contentPlanOf(november, []);
		expect(plan.monthLabel).toBe('November 2026');
		expect(plan.weeks.map((week) => week.days).map((days) => days.length)).toEqual([1, 7, 7, 7, 7, 1]);
		const [, firstFullWeek] = plan.weeks;
		expect(firstFullWeek.label).toBe('Week of Mon 2 Nov');
		expect([plan.previousMonthKey, plan.nextMonthKey]).toEqual(['2026-10', '2026-12']);
	});

	it('puts each piece on its day on the UK clock, a scheduled one on the day it is scheduled for', () => {
		const pieces = [
			piece('a', 'idea', '2026-11-03T09:00:00Z'),
			piece('b', 'scheduled', '2026-11-03T09:00:00Z', '2026-11-05T18:30:00Z'),
			piece('c', 'drafted', '2026-10-31T23:30:00Z')
		];
		const days = contentPlanOf(november, pieces).weeks.flatMap((week) => week.days);
		const dayOf = (id: string) => days.find((day) => day.entries.some((entry) => entry.id === id));
		expect(dayOf('a')?.date).toBe('2026-11-03');
		expect(dayOf('b')?.date).toBe('2026-11-05');
		expect(dayOf('c')).toBeUndefined();
	});

	it('reads summer time as the UK clock does', () => {
		const plan = contentPlanOf({ year: 2026, month: 7 }, [piece('a', 'idea', '2026-06-30T23:30:00Z')]);
		const [entry] = plan.weeks.flatMap((week) => week.days).flatMap((day) => day.entries);
		expect([entry.date, entry.time]).toEqual(['2026-07-01', '00:30']);
	});

	it('counts what is planned, scheduled, posted and still to do', () => {
		const pieces = [
			piece('a', 'idea', '2026-11-03T09:00:00Z'),
			piece('b', 'scheduled', null, '2026-11-05T09:00:00Z'),
			piece('c', 'published', null, '2026-11-06T09:00:00Z'),
			piece('d', 'approved', '2026-11-07T09:00:00Z')
		];
		expect(contentPlanOf(november, pieces).counts).toEqual({ planned: 4, scheduled: 1, published: 1, stillToDo: 2 });
	});

	it('shows each piece’s kind and how many of each kind the month holds, the most first', () => {
		const pieces = [
			{ ...piece('a', 'idea', '2026-11-03T09:00:00Z'), kind: 'review' },
			piece('b', 'idea', '2026-11-04T09:00:00Z'),
			piece('c', 'drafted', '2026-11-05T09:00:00Z'),
			{ ...piece('d', 'idea', '2026-11-06T09:00:00Z'), kind: null },
			{ ...piece('e', 'idea', '2026-10-06T09:00:00Z'), kind: 'our story' }
		];
		const plan = contentPlanOf(november, pieces);
		const [entry] = plan.weeks.flatMap((week) => week.days).flatMap((day) => day.entries);
		expect(entry.kind).toBe('review');
		expect(plan.kindCounts).toEqual([
			{ kind: 'tip', count: 2 },
			{ kind: 'No kind yet', count: 1 },
			{ kind: 'review', count: 1 }
		]);
	});

	it('lets every piece but a published one be moved, and shows the empty days as rows', () => {
		const pieces = [piece('a', 'idea', '2026-11-02T09:00:00Z'), piece('c', 'published', null, '2026-11-03T09:00:00Z')];
		const [, week] = contentPlanOf(november, pieces).weeks;
		const rows = planRowsOf(week);
		expect(rows).toHaveLength(7);
		const firstChannels = rows.map(({ post }) => post?.channels[0] ?? null);
		expect(firstChannels.map((channel) => channel?.canMove ?? null)).toEqual([true, false, null, null, null, null, null]);
		expect(rows[2]).toMatchObject({ dayLabel: 'Wed 4 Nov', post: null });
	});
});
