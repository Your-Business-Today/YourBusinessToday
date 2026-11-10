import { meetingStage, meetingStages, standingAgenda, type AgendaItem } from './boardroomMeeting';
import { boardRoomRefusals } from './boardroomRoomRules';
import { emptyMeetingRoom, openRoomOf, outcomeOfItem, stances } from './boardroomRoom';
import { currentProposal, currentRound, isStillToSpeak, itemTalkOf, seatInRoom, type ItemTalk } from './boardroomRoomTurns';
import type { ContributionDraft } from './validateBoardContribution';
import type { MeetingRecord } from './describeBoardroomMeeting';

/** Who is speaking and when: the director's account, and the moment. */
export type RoomCaller = { accountId: string; now: Date };

/** Where a contribution goes: the item and its talk so far, the seat, the round, and what it corrects or speaks on. */
export type ContributionPlace = {
	item: AgendaItem;
	talk: ItemTalk;
	seatId: string;
	round: number;
	onProposalId: string | null;
	correctsId: string | null;
};

type Found = { id: string | null };

function roundOf(talk: ItemTalk, seatId: string, draft: ContributionDraft): number | string {
	if (draft.correctsNumber !== null) {
		const corrected = talk.contributions[draft.correctsNumber - 1];
		if (corrected?.directorId !== seatId) return boardRoomRefusals.notYourContribution;
		return corrected.round;
	}
	const isOwnTurn = isStillToSpeak(talk, seatId);
	if (!isOwnTurn) return boardRoomRefusals.alreadySpokenThisRound;
	return currentRound(talk);
}

function proposalSpokenOn(talk: ItemTalk, draft: ContributionDraft): Found | string {
	const isOnAWording = draft.stance === stances.supports || draft.stance === stances.objects;
	if (!isOnAWording) return { id: null };
	const onTheTable = currentProposal(talk);
	if (draft.proposalNumber === null) return { id: onTheTable?.id ?? null };
	const named = talk.contributions[draft.proposalNumber - 1];
	if (named?.stance !== stances.proposes) return boardRoomRefusals.proposalNumberNotANumber;
	if (draft.stance === stances.objects) return { id: named.id };
	if (onTheTable === null) return boardRoomRefusals.nothingProposed;
	if (named.id !== onTheTable.id) return boardRoomRefusals.notTheWordingOnTheTable;
	return { id: named.id };
}

function itemInRoom(record: MeetingRecord, itemNumber: number, now: Date): AgendaItem | string {
	const openRoom = openRoomOf(record.room);
	if (openRoom === null) return boardRoomRefusals.roomNotOpen;
	if (meetingStage(record.meeting, now) === meetingStages.closed) return boardRoomRefusals.meetingHasClosed;
	const item = standingAgenda(record.items)[itemNumber - 1];
	if (item === undefined) return boardRoomRefusals.itemNotOnAgenda;
	if (outcomeOfItem(record.room ?? emptyMeetingRoom, item.id) !== null) return boardRoomRefusals.itemHasComeOut;
	return item;
}

/** Where a director's Claude's contribution goes, taking its turn as the room allows; or why it cannot be said. */
export function placeBoardContribution(record: MeetingRecord, draft: ContributionDraft, caller: RoomCaller): ContributionPlace | string {
	const item = itemInRoom(record, draft.itemNumber, caller.now);
	if (typeof item === 'string') return item;
	const seat = seatInRoom(record, caller.accountId, caller.now);
	if (seat === null) return boardRoomRefusals.callerNotOnMeeting;
	const talk = itemTalkOf(record, item, caller.now);
	const round = roundOf(talk, seat.id, draft);
	if (typeof round === 'string') return round;
	const onProposal = proposalSpokenOn(talk, draft);
	if (typeof onProposal === 'string') return onProposal;
	return { item, talk, seatId: seat.id, round, onProposalId: onProposal.id, correctsId: correctedId(talk, draft) };
}

function correctedId(talk: ItemTalk, draft: ContributionDraft): string | null {
	if (draft.correctsNumber === null) return null;
	return talk.contributions[draft.correctsNumber - 1]?.id ?? null;
}
