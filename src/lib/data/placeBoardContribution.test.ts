import { describe, expect, it } from 'vitest';
import { placeBoardContribution } from './placeBoardContribution';
import { boardRoomRefusals } from './boardroomRoomRules';
import { meetingInRoom, said } from './boardroomRoom.fixtures';
import { duringTheMeeting } from './boardroomMeeting.fixtures';
import type { ContributionDraft } from './validateBoardContribution';

const nigel = { accountId: 'nigel', now: duringTheMeeting };
const jeremy = { accountId: 'jeremy', now: duringTheMeeting };
const comment: ContributionDraft = { itemNumber: 1, stance: 'comments', words: 'A word.', wording: null, proposalNumber: null, correctsNumber: null };

describe('a Claude speaks in its turn, for its own director only', () => {
	it('places the first turn in round 1 under the caller’s own seat', () => {
		expect(placeBoardContribution(meetingInRoom(), comment, nigel)).toMatchObject({ seatId: 'nigels-seat', round: 1, correctsId: null });
	});

	it('refuses a second turn in a round until every director has spoken, then takes it in the next', () => {
		const first = said('nigels-seat', 1, 'comments');
		expect(placeBoardContribution(meetingInRoom({ contributions: [first] }), comment, nigel)).toBe(boardRoomRefusals.alreadySpokenThisRound);
		const both = [first, said('jeremys-seat', 1, 'comments')];
		expect(placeBoardContribution(meetingInRoom({ contributions: both }), comment, nigel)).toMatchObject({ round: 2 });
	});

	it('lets a Claude correct only its own contribution, in that contribution’s round', () => {
		const contributions = [said('nigels-seat', 1, 'comments'), said('jeremys-seat', 1, 'comments')];
		const correction = { ...comment, correctsNumber: 1 };
		expect(placeBoardContribution(meetingInRoom({ contributions }), correction, nigel)).toMatchObject({ round: 1, correctsId: contributions[0].id });
		expect(placeBoardContribution(meetingInRoom({ contributions }), correction, jeremy)).toBe(boardRoomRefusals.notYourContribution);
	});

	it('takes support only for the wording on the table', () => {
		const first = said('nigels-seat', 1, 'proposes');
		const second = said('jeremys-seat', 1, 'proposes');
		const support = { ...comment, stance: 'supports' as const, proposalNumber: 1 };
		const room = meetingInRoom({ contributions: [first, second] });
		expect(placeBoardContribution(room, support, nigel)).toBe(boardRoomRefusals.notTheWordingOnTheTable);
		expect(placeBoardContribution(room, { ...support, proposalNumber: 2 }, nigel)).toMatchObject({ round: 2, onProposalId: second.id });
		const nothingProposed = meetingInRoom({ contributions: [said('nigels-seat', 1, 'comments')] });
		expect(placeBoardContribution(nothingProposed, support, jeremy)).toBe(boardRoomRefusals.proposalNumberNotANumber);
	});

	it('refuses before the room opens, on an item that has come out, and anyone with no seat on the meeting', () => {
		expect(placeBoardContribution(meetingInRoom({ room: null }), comment, nigel)).toBe(boardRoomRefusals.roomNotOpen);
		const outcome = { agendaItemId: 'item-1', outcome: 'not_agreed' as const, proposalId: null, wording: null, roundsTaken: 3, reachedAt: '' };
		expect(placeBoardContribution(meetingInRoom({ outcomes: [outcome] }), comment, nigel)).toBe(boardRoomRefusals.itemHasComeOut);
		expect(placeBoardContribution(meetingInRoom(), comment, { ...nigel, accountId: 'staff' })).toBe(boardRoomRefusals.callerNotOnMeeting);
		expect(placeBoardContribution(meetingInRoom(), { ...comment, itemNumber: 3 }, nigel)).toBe(boardRoomRefusals.itemNotOnAgenda);
	});
});
