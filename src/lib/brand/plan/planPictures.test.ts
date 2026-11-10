import { describe, expect, it } from 'vitest';
import { contentPlanOf } from './contentPlanOf';
import { noPictures } from '../pictures/postPictures';
import type { PlannedPiece } from '../content/contentPiece';

const november = { year: 2026, month: 11 };
const tuesdayEvening = '2026-11-03T19:30:00Z';

function channel(id: string, postId: string, mediumPath: string): PlannedPiece {
	return { id, postId, mediumPath, kind: 'tip', title: `Post ${postId}`, hook: '', stage: 'drafted', plannedFor: tuesdayEvening, scheduledFor: null, updatedAt: '' };
}

const pieces = [channel('ig', 'doors', 'image.post.instagram'), channel('fb', 'doors', 'image.post.facebook'), channel('li', 'roofs', 'text.post.linkedin')];

describe('the pictures of the month’s posts', () => {
	it('marks a post that needs a picture and has none, once for every channel it goes out on', () => {
		const pictures = new Map([['doors', { ...noPictures, needed: 'The team fitting a door' }]]);
		const plan = contentPlanOf(november, pieces, [], pictures);
		const tuesday = plan.weeks[1].days.find((day) => day.date === '2026-11-03')!;
		expect(tuesday.posts.map(({ postId, picture }) => [postId, picture.standing])).toEqual([
			['doors', 'waiting'],
			['roofs', 'none_said']
		]);
		expect(plan.awaitingPictureCount).toBe(1);
	});

	it('reads every post as one nobody has said anything of while no pictures are given', () => {
		const plan = contentPlanOf(november, pieces);
		expect(plan.awaitingPictureCount).toBe(0);
		const [, week] = plan.weeks;
		const tuesday = week.days.find((day) => day.date === '2026-11-03')!;
		expect(tuesday.posts.every(({ picture }) => picture.standing === 'none_said')).toBe(true);
	});
});
