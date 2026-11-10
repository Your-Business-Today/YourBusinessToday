import { describe, expect, it } from 'vitest';
import { describeBoardItem } from './describeBoardItem';
import { describeBoardroomMeeting } from './describeBoardroomMeeting';
import { itemTalkOf } from './boardroomRoomTurns';
import { meetingInRoom, said } from './boardroomRoom.fixtures';
import { duringTheMeeting } from './boardroomMeeting.fixtures';
import { nigelsSecondBrief } from './boardroomBrief.fixtures';
import type { ItemOutcome } from './boardroomRoom';

const proposal = said('nigels-seat', 1, 'proposes');
const objection = said('jeremys-seat', 1, 'objects', { onProposalId: proposal.id, words: 'Not before the audit.' });

function readingOf(outcome: ItemOutcome | null = null) {
	const briefing = { seatId: 'nigels-seat', ownBriefs: [nigelsSecondBrief], briefsIn: [] };
	const record = { ...meetingInRoom({ contributions: [proposal, objection] }), briefing };
	const item = record.items[0];
	return { record, item, itemNumber: 1, talk: itemTalkOf(record, item, duringTheMeeting), outcome, seatId: 'nigels-seat' };
}

describe('reading an item in the room', () => {
	it('gives everything said in order, numbered, with who it speaks for, and the reader’s own brief', () => {
		const text = describeBoardItem('Your Business Today', readingOf());
		expect(text).toContain('1. Round 1, Nigel’s Claude');
		expect(text).toContain('proposes: "Approve the accounts."');
		expect(text).toContain('2. Round 1, Jeremy’s Claude');
		expect(text).toContain('objects the wording in 1');
		expect(text).toContain(`Your position: ${nigelsSecondBrief.position}`);
		expect(text).toContain('Where it stands: Round 2 of 3.');
		expect(text).toContain('It is your turn');
	});

	it('sets out each director’s position when an item comes out not agreed', () => {
		const notAgreed = { agendaItemId: 'item-1', outcome: 'not_agreed' as const, proposalId: null, wording: null, roundsTaken: 3, reachedAt: '' };
		const text = describeBoardItem('Your Business Today', readingOf(notAgreed));
		expect(text).toContain('Came out not agreed in round 3');
		expect(text).toContain('- Jeremy: objects. Not before the audit.');
	});

	it('shows on the meeting where each item stands in the room', () => {
		const text = describeBoardroomMeeting('Your Business Today', meetingInRoom({ contributions: [proposal] }), duringTheMeeting);
		expect(text).toContain('In the room: Round 1 of 3. Wording on the table: "Approve the accounts." (contribution 1). Still to speak this round: Jeremy.');
	});
});
