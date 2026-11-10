import { describe, expect, it } from 'vitest';
import { awaitingApprovalOf, piecesShownOf } from './awaitingApproval';
import { checkMonthApproval } from './checkMonthApproval';
import { contentPlanOf } from '../plan/contentPlanOf';
import { describeApprovalGiven } from './monthApprovalWords';
import { noPictures } from '../pictures/postPictures';
import { sortAskedPieces } from './askedPieces';
import type { ContentStage, PlannedPiece } from '../content/contentPiece';

const november = { year: 2026, month: 11 };
const lastChanged = '2026-11-01T10:00:00.123456+00:00';
const doorsOnInstagram = '11111111-1111-4111-8111-111111111111';
const doorsOnFacebook = '22222222-2222-4222-8222-222222222222';
const roofsOnLinkedIn = '33333333-3333-4333-8333-333333333333';
const decemberPiece = '44444444-4444-4444-8444-444444444444';

function channel(id: string, postId: string, mediumPath: string, stage: ContentStage): PlannedPiece {
	const day = { plannedFor: '2026-11-03T09:00:00Z', scheduledFor: null, updatedAt: lastChanged };
	return { id, postId, mediumPath, kind: 'tip', title: `Post ${postId}`, hook: '', caption: `Words for ${id}`, stage, ...day };
}

const pieces = [
	channel(doorsOnInstagram, 'doors', 'image.post.instagram', 'awaiting_approval'),
	channel(doorsOnFacebook, 'doors', 'image.post.facebook', 'drafted'),
	channel(roofsOnLinkedIn, 'roofs', 'text.post.linkedin', 'awaiting_approval')
];
const plan = contentPlanOf(november, pieces, [], new Map([['doors', { ...noPictures, needed: 'The team at a fire door' }]]));

describe('the month’s posts waiting for approval', () => {
	it('gathers each waiting channel under its post, leaving out the channels at any other stage', () => {
		const posts = awaitingApprovalOf(plan);
		expect(posts.map((post) => [post.postId, post.channels.map((channel) => channel.id)])).toEqual([
			['doors', [doorsOnInstagram]],
			['roofs', [roofsOnLinkedIn]]
		]);
		expect(posts[0]).toMatchObject({ dayLabel: 'Tue 3 Nov', time: '09:00', picture: { standing: 'waiting' } });
		expect(piecesShownOf(posts)).toEqual([
			{ contentPieceId: doorsOnInstagram, updatedAt: lastChanged },
			{ contentPieceId: roofsOnLinkedIn, updatedAt: lastChanged }
		]);
	});
});

describe('checking a month’s approval', () => {
	const shown = { contentPieceId: doorsOnInstagram, updatedAt: lastChanged };

	it('takes the month and each piece as shown, keeping the moment as UTC', () => {
		const check = checkMonthApproval({ month: '2026-11', pieces: [shown] });
		expect(check).toEqual({ asked: { month: november, pieces: [{ contentPieceId: doorsOnInstagram, updatedAt: '2026-11-01T10:00:00.123Z' }] } });
	});

	it('refuses by name whatever does not fit, never repairing it', () => {
		const problemOf = (pieces: unknown, month = '2026-11') => {
			const check = checkMonthApproval({ month, pieces });
			return 'problem' in check ? check.problem : null;
		};
		expect(problemOf([shown], 'Nov')).toContain('month is a year and a month');
		expect(problemOf('all')).toContain('pieces is a list');
		expect(problemOf([])).toContain('pieces is empty');
		expect(problemOf([{ ...shown, contentPieceId: 'piece-1' }])).toBe('pieces 1: contentPieceId is a piece’s id, as read_content_plan gives it');
		expect(problemOf([{ ...shown, updatedAt: 'yesterday' }])).toContain('pieces 1: updatedAt is an ISO date');
		expect(problemOf([shown, shown])).toBe(`pieces gives ${doorsOnInstagram} twice; give each piece once`);
		expect(problemOf(Array(501).fill(shown))).toBe('pieces holds 501; approve at most 500 at once');
	});
});

describe('holding the pieces shown against the month as it stands', () => {
	it('approves only what is still awaiting approval as it was read, and names the rest with the reason', () => {
		const sorted = sortAskedPieces(plan, [
			{ contentPieceId: doorsOnInstagram, updatedAt: '2026-11-01T10:00:00.123Z' },
			{ contentPieceId: doorsOnFacebook, updatedAt: lastChanged },
			{ contentPieceId: roofsOnLinkedIn, updatedAt: '2026-10-31T10:00:00Z' },
			{ contentPieceId: decemberPiece, updatedAt: lastChanged }
		]);
		expect(sorted.toApprove.map((entry) => entry.id)).toEqual([doorsOnInstagram]);
		expect(sorted.left.map(({ contentPieceId, reason, stage }) => [contentPieceId, reason, stage])).toEqual([
			[doorsOnFacebook, 'moved_on', 'drafted'],
			[roofsOnLinkedIn, 'changed_since', 'awaiting_approval'],
			[decemberPiece, 'not_in_month', null]
		]);
	});

	it('says how many were approved, how many of those posts wait on a picture, and each piece left', () => {
		const left = sortAskedPieces(plan, [{ contentPieceId: doorsOnFacebook, updatedAt: lastChanged }]).left;
		const words = describeApprovalGiven({ kind: 'given', monthLabel: 'November 2026', approvedCount: 2, postCount: 1, awaitingPictureCount: 1, left });
		expect(words).toBe(
			'Approved 2 pieces on 1 post for November 2026. 1 approved post still waits on its picture. ' +
				'“Post doors” on Facebook image post was left as it was: it is drafted now, no longer awaiting approval.'
		);
	});
});
