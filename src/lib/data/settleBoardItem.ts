import { stances, outcomeKinds, type BoardContribution, type OutcomeDraft } from './boardroomRoom';
import { currentProposal, latestOfSeat, roundsCompleted, type ItemTalk } from './boardroomRoomTurns';

/** A seat agrees when the last thing its Claude said proposed the wording on the table, or supported it. */
function seatAgrees(talk: ItemTalk, seatId: string, proposal: BoardContribution): boolean {
	const latest = latestOfSeat(talk, seatId);
	if (latest === null) return false;
	if (latest.id === proposal.id) return true;
	return latest.stance === stances.supports && latest.onProposalId === proposal.id;
}

function roundsSpoken(talk: ItemTalk): number {
	return Math.max(0, ...talk.contributions.map((contribution) => contribution.round));
}

function agreedOn(talk: ItemTalk, proposal: BoardContribution): OutcomeDraft {
	return { outcome: outcomeKinds.agreed, proposalId: proposal.id, wording: proposal.wording, roundsTaken: roundsSpoken(talk) };
}

/**
 * How an item comes out of the room, or null while it is still being talked through: agreed the moment every
 * seat on it agrees the wording on the table, and not agreed once every seat has had every round the room allows.
 */
export function settleBoardItem(talk: ItemTalk): OutcomeDraft | null {
	const { seatIds, roundsLimit } = talk;
	if (seatIds.length === 0 || roundsLimit === 0) return null;
	const proposal = currentProposal(talk);
	const isAgreed = proposal !== null && talk.seatIds.every((seatId) => seatAgrees(talk, seatId, proposal));
	if (isAgreed) return agreedOn(talk, proposal);
	if (roundsCompleted(talk) < talk.roundsLimit) return null;
	return { outcome: outcomeKinds.notAgreed, proposalId: null, wording: null, roundsTaken: talk.roundsLimit };
}
