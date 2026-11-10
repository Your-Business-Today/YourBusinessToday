import { describe, expect, it } from 'vitest';
import { contentPlanOf } from '$lib/brand/plan/contentPlanOf';
import { describeContentPlan } from './describeContentPlan';
import type { PlannedPiece } from '$lib/brand/content/contentPiece';
import type { PostingRhythm } from '$lib/brand/rhythm/postingRhythm';

const november = { year: 2026, month: 11 };
const everywhere: PostingRhythm = { mediumPath: 'all', medium: 'Everywhere', days: ['Monday', 'Wednesday', 'Thursday'], time: '19:30', postsAWeek: 3 };
const linkedIn: PostingRhythm = { mediumPath: 'text.post.linkedin', medium: 'LinkedIn post', days: null, time: null, postsAWeek: 1 };

function piece(id: string, plannedFor: string): PlannedPiece {
	return { id, postId: id, mediumPath: 'image.post.instagram', kind: 'tip', title: `Post ${id}`, hook: '', stage: 'idea', plannedFor, scheduledFor: null, updatedAt: '' };
}

const pieces = [piece('mon', '2026-11-02T19:30:00Z'), piece('wed', '2026-11-04T19:30:00Z'), piece('sat', '2026-11-07T19:30:00Z')];

describe('the month’s plan as a Claude reads it before planning', () => {
	it('gives the posting rhythm, each one where it is decided, and how to plan to it', () => {
		const reading = describeContentPlan('Jewel', contentPlanOf(november, pieces, [everywhere, linkedIn]));
		expect(reading).toContain(
			'Posting rhythm: Everywhere — 3 a week on Monday, Wednesday, Thursday at 19:30; LinkedIn post — 1 a week. ' +
				'A post counts towards the rhythm decided nearest its medium. Plan new posts on the posting days at the posting time'
		);
	});

	it('gives each week against the number due, the day a post is due, and a post outside the rhythm as extra', () => {
		const reading = describeContentPlan('Jewel', contentPlanOf(november, pieces, [everywhere, linkedIn]));
		expect(reading).toContain('Week of Mon 2 Nov — Everywhere 2 of 3 due, short by 1, 1 extra; LinkedIn post 0 of 1 due, short by 1');
		expect(reading).toContain('- Thu 5 Nov: nothing planned — a post is due for Everywhere');
		expect(reading).toContain('Post sat (tip) @ image.post.instagram (id sat) [extra: outside the posting rhythm]');
	});

	it('says how to record a rhythm while the kit has none', () => {
		const reading = describeContentPlan('Jewel', contentPlanOf(november, pieces));
		expect(reading).toContain('No posting rhythm is in the kit yet: record behaviour.postingDays, behaviour.postingTime and behaviour.postsAWeek');
		expect(reading).toContain('Week of Mon 2 Nov\n- Mon 2 Nov 19:30');
	});
});
