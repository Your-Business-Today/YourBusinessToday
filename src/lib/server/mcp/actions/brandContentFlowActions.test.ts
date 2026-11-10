import './brandContentFlowMocks';
import { beforeEach, describe, expect, it } from 'vitest';
import { contentPieceId } from './brandContentFixtures';
import { flowWorld, resetFlowWorld } from './brandContentFlowWorld';
import { moduleNotSwitchedOn } from '../organisationModuleGate';
import { runContentAction } from './brandContentTestWorld';

const piece = { contentPieceId };
const inDecember = { ...piece, scheduledFor: '2026-12-01T09:00:00Z' };
const onTikTok = { ...piece, publishedUrl: 'https://www.tiktok.com/@jewel/video/1' };

describe('taking a piece from drafted, through approval, to published', () => {
	beforeEach(() => resetFlowWorld('drafted'));

	it('is refused while Brand is off for the organisation', async () => {
		flowWorld.switchedOn = [];
		expect(await runContentAction('send_content_for_approval', piece)).toBe(moduleNotSwitchedOn('brand'));
	});

	it('goes the whole way by the allowed steps, scheduling and posting left by hand', async () => {
		expect(await runContentAction('send_content_for_approval', piece)).toContain('awaiting_approval');
		expect(await runContentAction('review_content', { ...piece, verdict: 'approved' })).toContain('now at approved');
		expect(await runContentAction('schedule_content', inDecember)).toContain('post it by hand');
		expect(await runContentAction('record_publication', onTikTok)).toContain('the piece is at published');
		const stages = flowWorld.moves.map(({ rule }) => rule.to);
		expect(stages).toEqual(['awaiting_approval', 'approved', 'scheduled', 'published']);
		expect(flowWorld.moves[2]).toMatchObject({ scheduledFor: '2026-12-01T09:00:00.000Z' });
	});

	it('refuses a step the piece is not at, by name, changing nothing', async () => {
		expect(await runContentAction('schedule_content', inDecember)).toContain('Only an approved piece can be scheduled');
		expect(await runContentAction('record_publication', onTikTok)).toContain('this one is at drafted');
		expect(flowWorld.moves).toHaveLength(0);
	});

	it('refuses a value that does not fit before the piece is touched', async () => {
		flowWorld.stage = 'approved';
		const soon = { ...piece, scheduledFor: 'soon' };
		expect(await runContentAction('schedule_content', soon)).toContain('scheduledFor is an ISO date and time');
		const notALink = { ...piece, publishedUrl: 'not a link' };
		expect(await runContentAction('record_publication', notALink)).toContain('public web address');
		expect(flowWorld.moves).toHaveLength(0);
	});

	it('says when the brand holds no piece of that id', async () => {
		flowWorld.stage = null;
		const noPiece = { contentPieceId: 'not-an-id' };
		expect(await runContentAction('send_content_for_approval', noPiece)).toContain('No piece of that id');
		expect(await runContentAction('send_content_for_approval', piece)).toContain('No piece of that id');
	});
});
