import { describe, expect, it } from 'vitest';
import { boardMeetingViewOf } from './boardMeetingView';
import { describeBoardItem } from './describeBoardItem';
import { itemTalkOf } from './boardroomRoomTurns';
import { meetingInRoom, said } from './boardroomRoom.fixtures';
import { controlsOf, heldPiece, settingChange } from './boardroomSeatControls.fixtures';
import { duringTheMeeting } from './boardroomMeeting.fixtures';

const proposal = said('nigels-seat', 1, 'proposes');
const steered = controlsOf('jeremys-seat', {
	steerNotes: [{ id: 'note', words: 'Ask about the bank’s letter.', writtenAt: '2026-11-12T10:05:00.000Z' }],
	settingChanges: [settingChange('ask_me_first', true, 1)],
	held: [heldPiece()]
});

describe('a director follows the meeting on its page', () => {
	it('shows everything said on each item as it is said, and where it stands', () => {
		const view = boardMeetingViewOf(meetingInRoom({ contributions: [proposal] }), duringTheMeeting);
		const [first] = view.agenda;
		expect(first.room.said).toEqual([expect.objectContaining({ number: 1, speakerName: 'Nigel’s Claude', round: 1 })]);
		expect(first.room.said[0].stanceWords).toBe('proposes: "Approve the accounts."');
		expect(first.room.standing).toContain('Still to speak this round: Jeremy.');
	});

	it('shows the reader their own Claude, its notes and the piece it holds, and nobody without a seat sees any', () => {
		const record = { ...meetingInRoom({ contributions: [proposal] }), controls: steered };
		const view = boardMeetingViewOf(record, duringTheMeeting);
		expect(view.ownClaude).toMatchObject({ isPaused: false, isAskingFirst: true, canChange: true });
		expect(view.agenda[0].held?.words).toBe(heldPiece().words);
		expect(boardMeetingViewOf(meetingInRoom(), duringTheMeeting).ownClaude).toBeNull();
	});

	it('gives a Claude its own director’s latest note and settings when it reads the item', () => {
		const record = { ...meetingInRoom({ contributions: [proposal] }), controls: steered };
		const item = record.items[0];
		const reading = { record, item, itemNumber: 1, talk: itemTalkOf(record, item, duringTheMeeting), outcome: null, seatId: 'jeremys-seat' };
		const words = describeBoardItem('Your Business Today', reading);
		expect(words).toContain('Ask about the bank’s letter.');
		expect(words).toContain('each piece you speak is held for their yes');
		expect(words).toContain('A piece of yours on this item waits for your director’s answer');
	});
});
