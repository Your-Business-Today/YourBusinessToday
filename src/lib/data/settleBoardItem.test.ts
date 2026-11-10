import { describe, expect, it } from 'vitest';
import { settleBoardItem } from './settleBoardItem';
import { currentRound, seatsYetToSpeak, type ItemTalk } from './boardroomRoomTurns';
import { said } from './boardroomRoom.fixtures';
import type { BoardContribution } from './boardroomRoom';

const seatIds = ['nigels-seat', 'jeremys-seat'];

function talkOf(contributions: BoardContribution[], roundsLimit = 3): ItemTalk {
	return { contributions, seatIds, roundsLimit };
}

describe('the room takes turns and settles an item', () => {
	it('gives every seat one turn a round, and counts a correction within its turn', () => {
		const nigelsProposal = said('nigels-seat', 1, 'proposes');
		const talk = talkOf([nigelsProposal, said('nigels-seat', 1, 'comments', { correctsId: nigelsProposal.id })]);
		expect(currentRound(talk)).toBe(1);
		expect(seatsYetToSpeak(talk)).toEqual(['jeremys-seat']);
	});

	it('comes out agreed the moment every seat supports the wording on the table', () => {
		const proposal = said('nigels-seat', 1, 'proposes');
		const support = said('jeremys-seat', 1, 'supports', { onProposalId: proposal.id });
		expect(settleBoardItem(talkOf([proposal, support]))).toEqual({
			outcome: 'agreed',
			proposalId: proposal.id,
			wording: 'Approve the accounts.',
			roundsTaken: 1
		});
	});

	it('does not count support for a wording that a later proposal has replaced', () => {
		const first = said('nigels-seat', 1, 'proposes');
		const support = said('jeremys-seat', 1, 'supports', { onProposalId: first.id });
		const second = said('nigels-seat', 2, 'proposes', { wording: 'Approve the accounts, subject to audit.' });
		expect(settleBoardItem(talkOf([first, support, second]))).toBeNull();
	});

	it('comes out not agreed once every seat has had every round, and not before', () => {
		const proposal = said('nigels-seat', 1, 'proposes');
		const objection = said('jeremys-seat', 1, 'objects', { onProposalId: proposal.id });
		expect(settleBoardItem(talkOf([proposal, objection], 2))).toBeNull();
		const rounds = [proposal, objection, said('nigels-seat', 2, 'comments'), said('jeremys-seat', 2, 'objects')];
		expect(settleBoardItem(talkOf(rounds, 2))).toEqual({ outcome: 'not_agreed', proposalId: null, wording: null, roundsTaken: 2 });
	});

	it('settles nothing before the room is open or with nobody on the meeting', () => {
		expect(settleBoardItem({ contributions: [], seatIds, roundsLimit: 0 })).toBeNull();
		expect(settleBoardItem({ contributions: [], seatIds: [], roundsLimit: 3 })).toBeNull();
	});
});
