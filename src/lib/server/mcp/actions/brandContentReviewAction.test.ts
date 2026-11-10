import './brandContentFlowMocks';
import { beforeEach, describe, expect, it } from 'vitest';
import { contentPieceId } from './brandContentFixtures';
import { flowWorld, resetFlowWorld } from './brandContentFlowWorld';
import { runContentAction } from './brandContentTestWorld';

const piece = { contentPieceId };
const approval = { ...piece, verdict: 'approved' };
const changes = { ...piece, verdict: 'changes_requested', body: 'Shorter hook' };

describe('reviewing a piece of a brand’s content', () => {
	beforeEach(() => resetFlowWorld('awaiting_approval'));

	it('approves a piece awaiting approval, keeping who approved it', async () => {
		expect(await runContentAction('review_content', approval)).toContain('now at approved');
		expect(flowWorld.reviews).toEqual([expect.objectContaining({ authorId: 'nigel', organisationId: 'jewel' })]);
	});

	it('sends a piece back to drafted when changes are asked, keeping what was said', async () => {
		expect(await runContentAction('review_content', changes)).toContain('now at drafted');
		const review = { verdict: 'changes_requested', body: 'Shorter hook' };
		expect(flowWorld.reviews).toEqual([expect.objectContaining({ review })]);
	});

	it('keeps a comment on any piece without moving it', async () => {
		flowWorld.stage = 'published';
		const comment = { ...piece, verdict: 'comment', body: 'Did well' };
		expect(await runContentAction('review_content', comment)).toContain('stays at published');
		expect(flowWorld.moves).toHaveLength(0);
	});

	it('refuses to approve a piece that is not awaiting approval, keeping nothing', async () => {
		flowWorld.stage = 'drafted';
		expect(await runContentAction('review_content', approval)).toContain('this one is at drafted. Nothing was kept.');
		expect(flowWorld.reviews).toHaveLength(0);
	});

	it('refuses a review that does not fit by name, keeping nothing', async () => {
		const silent = { ...piece, verdict: 'changes_requested' };
		expect(await runContentAction('review_content', silent)).toContain('body is empty');
		const tooLong = { ...piece, verdict: 'comment', body: 'x'.repeat(2001) };
		expect(await runContentAction('review_content', tooLong)).toContain('keep it to 2000');
		expect(flowWorld.reviews).toHaveLength(0);
	});

	it('says when the brand holds no piece of that id', async () => {
		flowWorld.stage = null;
		expect(await runContentAction('review_content', approval)).toContain('No piece of that id');
	});
});
