import './brandContentMonthApprovalSetup';
import { beforeEach, describe, expect, it } from 'vitest';
import { approvalIds as ids, approvalWorld as world, lastChanged, resetApprovalWorld } from './brandContentMonthApprovalWorld';
import { runContentAction } from './brandContentTestWorld';

const shown = (contentPieceId: string) => ({ contentPieceId, updatedAt: lastChanged });

describe('a client approving the month’s posts over the connector', () => {
	beforeEach(resetApprovalWorld);

	it('reads every waiting piece with its own words, its post’s picture, its id and when it last changed', async () => {
		const plan = await runContentAction('read_content_plan', { month: '2026-11' });
		expect(plan).toContain('Waiting for approval this month: 3 pieces.');
		expect(plan).toContain('- Tue 3 Nov 09:00 Post doors [waiting on a picture] — picture needed: The team at a fire door');
		expect(plan).toContain(`    - Instagram post (id ${ids.doorsOnInstagram}, updatedAt ${lastChanged}): “Words for image.post.instagram”`);
	});

	it('approves every piece as read, each kept as a review by the person who gave it', async () => {
		const answer = await runContentAction('approve_content_month', { month: '2026-11', pieces: Object.values(ids).map(shown) });
		expect(answer).toBe(
			'Approved 3 pieces on 2 posts for November 2026. 1 approved post still waits on its picture. ' +
				'To ask for a change to one post, call review_content on its piece with verdict changes_requested.'
		);
		expect([...world.stages.values()]).toEqual(['approved', 'approved', 'approved']);
		expect(world.reviews).toHaveLength(3);
		expect(world.reviews[0]).toMatchObject({ authorId: 'nigel', organisationId: 'jewel', contentPieceId: ids.doorsOnInstagram, review: { verdict: 'approved', body: 'Approved with the plan for November 2026.' } });
	});

	it('leaves a piece changed since it was read, naming it, without undoing the others', async () => {
		world.updatedAt.set(ids.roofsOnLinkedIn, '2026-11-02T08:00:00Z');
		const answer = await runContentAction('approve_content_month', { month: '2026-11', pieces: Object.values(ids).map(shown) });
		expect(answer).toContain('Approved 2 pieces on 1 post for November 2026.');
		expect(answer).toContain('“Post roofs” on LinkedIn post was left as it was: it changed after it was read');
		expect(answer).toContain('Call read_content_plan to read the month again');
		expect(world.stages.get(ids.roofsOnLinkedIn)).toBe('awaiting_approval');
		expect(world.reviews).toHaveLength(2);
	});

	it('names a piece someone moved on while the month was being approved, keeping the others', async () => {
		world.movedOnByOthers.add(ids.doorsOnInstagram);
		const answer = await runContentAction('approve_content_month', { month: '2026-11', pieces: Object.values(ids).map(shown) });
		expect(answer).toContain('Approved 2 pieces on 2 posts for November 2026.');
		expect(answer).toContain('“Post doors” on Instagram post was left as it was: someone else moved it on while it was being approved.');
		expect(world.reviews).toHaveLength(2);
	});

	it('names a piece that is no longer awaiting approval, and one not in the month', async () => {
		world.stages.set(ids.doorsOnFacebook, 'drafted');
		const elsewhere = '44444444-4444-4444-8444-444444444444';
		const answer = await runContentAction('approve_content_month', { month: '2026-11', pieces: [shown(ids.doorsOnFacebook), shown(elsewhere)] });
		expect(answer).toContain('Approved 0 pieces on 0 posts');
		expect(answer).toContain('it is drafted now, no longer awaiting approval');
		expect(answer).toContain(`The piece ${elsewhere} was left as it was: it is not on this month’s plan.`);
		expect(world.reviews).toHaveLength(0);
	});

	it('refuses an approval that does not fit by name, approving nothing', async () => {
		const answer = await runContentAction('approve_content_month', { month: '2026-11', pieces: [{ contentPieceId: ids.doorsOnFacebook }] });
		expect(answer).toBe('Nothing was approved: pieces 1: updatedAt is an ISO date and time with its zone, such as 2026-12-01T09:00:00Z. Nothing was changed.');
		expect(world.reviews).toHaveLength(0);
	});
});
