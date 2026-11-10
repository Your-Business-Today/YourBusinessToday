import { standingAgenda } from './boardroomMeeting';
import { itemTalkOf } from './boardroomRoomTurns';
import { numberOf } from './describeBoardContribution';
import { seatControlRefusals } from './boardroomSeatControlRules';
import type { HeldContribution } from './boardroomSeatControls';
import type { ContributionDraft } from './validateBoardContribution';
import type { MeetingRecord } from './describeBoardroomMeeting';

/**
 * A held piece as speak_on_board_item would have been given it now: the item and the contributions it names by
 * their numbers in the room as it stands, so the director's yes is placed by the same rules as any turn.
 */
export function draftOfHeld(record: MeetingRecord, held: HeldContribution, now: Date): ContributionDraft | string {
	const agenda = standingAgenda(record.items);
	const index = agenda.findIndex((item) => item.id === held.agendaItemId);
	if (index === -1) return seatControlRefusals.heldItemGone;
	const talk = itemTalkOf(record, agenda[index], now);
	return {
		itemNumber: index + 1,
		stance: held.stance,
		words: held.words,
		wording: held.wording,
		proposalNumber: numberOf(talk.contributions, held.onProposalId),
		correctsNumber: numberOf(talk.contributions, held.correctsId)
	};
}
