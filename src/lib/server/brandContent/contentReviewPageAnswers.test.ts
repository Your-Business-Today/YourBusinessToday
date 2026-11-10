import { describe, expect, it } from 'vitest';
import { pageAnswerFor } from './contentReviewPageAnswers';

describe('what the piece’s page answers a review', () => {
	it('says where the piece now stands when the review moved it', () => {
		expect(pageAnswerFor({ kind: 'moved', stage: 'approved' })).toEqual({ message: 'Your review is kept and the piece is now approved.' });
	});

	it('fails with the reason when the review does not fit, keeping nothing', () => {
		const answer = pageAnswerFor({ kind: 'refused', problem: 'body is empty' });
		expect(answer).toMatchObject({ status: 400, data: { message: 'Your review was not kept: body is empty.' } });
	});

	it('fails as a conflict when the piece is no longer awaiting approval', () => {
		const refusal = 'Only a piece awaiting approval can be approved';
		const answer = pageAnswerFor({ kind: 'wrongStage', refusal, stage: 'scheduled' });
		expect(answer).toMatchObject({ status: 409, data: { message: `${refusal}, and this one is scheduled. Nothing was kept.` } });
	});

	it('fails as not found when the brand holds no such piece', () => {
		expect(pageAnswerFor({ kind: 'noSuchPiece' })).toMatchObject({ status: 404 });
	});
});
