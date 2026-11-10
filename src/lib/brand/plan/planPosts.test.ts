import { describe, expect, it } from 'vitest';
import { contentPlanOf } from './contentPlanOf';
import { planRowsOf } from './planRows';
import type { PlannedPiece } from '../content/contentPiece';

const november = { year: 2026, month: 11 };
const tuesdayEvening = '2026-11-03T19:30:00Z';

function channel(id: string, postId: string, mediumPath: string, stage: PlannedPiece['stage'] = 'drafted'): PlannedPiece {
	return { id, postId, mediumPath, kind: 'tip', title: `Post ${postId}`, hook: '', stage, plannedFor: tuesdayEvening, scheduledFor: null, updatedAt: '' };
}

describe('a post on several channels in the month’s plan', () => {
	const pieces = [
		channel('ig', 'doors', 'image.post.instagram'),
		channel('fb', 'doors', 'image.post.facebook', 'approved'),
		channel('li', 'roofs', 'text.post.linkedin')
	];

	it('shows one post with every channel it goes out on, each at its own stage', () => {
		const [, week] = contentPlanOf(november, pieces).weeks;
		const tuesday = week.days.find((day) => day.date === '2026-11-03')!;
		expect(tuesday.posts.map((post) => [post.postId, post.channels.map((entry) => `${entry.id}:${entry.stage}`)])).toEqual([
			['doors', ['ig:drafted', 'fb:approved']],
			['roofs', ['li:drafted']]
		]);
	});

	it('gives the post one row of the week, its day named once', () => {
		const [, week] = contentPlanOf(november, pieces).weeks;
		const tuesdayRows = planRowsOf(week).filter((row) => row.post !== null);
		const postRows = tuesdayRows.map(({ dayLabel, post }) => [dayLabel, post?.title, post?.channels]);
		expect(postRows.map(([dayLabel, title, channels]) => [dayLabel, title, (channels as unknown[]).length])).toEqual([
			['Tue 3 Nov', 'Post doors', 2],
			['', 'Post roofs', 1]
		]);
	});

	it('still counts every channel towards the counts of the month', () => {
		expect(contentPlanOf(november, pieces).counts).toMatchObject({ planned: 3 });
	});
});
