import { describe, expect, it } from 'vitest';
import { awaitingPieceRowOf, contentPiecePageOf } from './contentPiecePage';
import type { ContentPiece } from '../content/contentPiece';

const piece: ContentPiece = {
	id: 'piece-1',
	mediumPath: 'text.email',
	title: 'Spring offer',
	stage: 'awaiting_approval',
	scheduledFor: null,
	updatedAt: '2026-11-10T10:00:00Z',
	hook: 'Fix it before it rains',
	script: 'All of it',
	storyboard: [{ description: 'A roof', seconds: 3, onScreenText: '' }],
	caption: 'Book now',
	kind: 'seasonal',
	invitedAction: 'replyToUs',
	publishedUrl: '',
	brandSnapshot: {},
	plannedFor: null
};

describe('a piece of a brand’s content as its page shows it', () => {
	it('says what it is for, asks and stands at, with its shots numbered from one', () => {
		const page = contentPiecePageOf(piece, []);
		expect(page.medium).not.toBe('text.email');
		expect(page.invitedAction).toBe('Reply to us');
		expect(page.isAwaitingApproval).toBe(true);
		expect(page.shots).toEqual([{ number: 1, description: 'A roof', seconds: 3, onScreenText: '' }]);
	});

	it('is not awaiting approval once it has moved on, and says when it invites nothing', () => {
		const page = contentPiecePageOf({ ...piece, stage: 'approved', invitedAction: '' }, []);
		expect(page.isAwaitingApproval).toBe(false);
		expect(page.invitedAction).toBe('Nothing in particular');
	});

	it('keeps every review in the order it was given, each with a key of its own', () => {
		const review = { verdict: 'comment', body: 'Nice', createdAt: '2026-11-10T11:00:00Z' };
		const { reviews } = contentPiecePageOf(piece, [review, review]);
		expect(reviews.map((entry) => entry.key)).toHaveLength(new Set(reviews.map((entry) => entry.key)).size);
	});

	it('lists a piece waiting for approval by its title and medium, and names a medium it does not know by its path', () => {
		expect(awaitingPieceRowOf({ ...piece, mediumPath: 'not.a.medium' })).toEqual({
			id: 'piece-1',
			title: 'Spring offer',
			medium: 'not.a.medium',
			updatedAt: '2026-11-10T10:00:00Z'
		});
	});
});
