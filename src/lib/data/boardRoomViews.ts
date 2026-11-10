import { nameOfSeat, type AgendaItem } from './boardroomMeeting';
import { emptyMeetingRoom, outcomeOfItem, type BoardContribution, type OutcomeKind } from './boardroomRoom';
import { itemTalkOf } from './boardroomRoomTurns';
import { correctionWords, numberOf, stanceWords } from './describeBoardContribution';
import { outcomeLine, talkingLine } from './describeBoardroomRoom';
import { ukMeetingTime } from './ukMeetingTime';
import type { BoardroomDirector } from './boardroomDirector';
import type { MeetingRecord } from './describeBoardroomMeeting';

/** One thing said on an item, as every director reads it on the meeting's page. */
export type BoardContributionView = {
	id: string;
	number: number;
	speakerName: string;
	round: number;
	stanceWords: string;
	correction: string;
	words: string;
	when: string;
};

/** An item in the room as the page shows it: everything said on it in order, and where it stands. */
export type ItemRoomView = {
	isOpen: boolean;
	said: BoardContributionView[];
	standing: string;
	outcome: OutcomeKind | null;
};

const roomNotOpenWords = 'The room has not been opened yet.';

function contributionView(contribution: BoardContribution, onItem: BoardContribution[], directors: BoardroomDirector[]): BoardContributionView {
	return {
		id: contribution.id,
		number: numberOf(onItem, contribution.id) ?? 0,
		speakerName: `${nameOfSeat(directors, contribution.directorId)}’s Claude`,
		round: contribution.round,
		stanceWords: stanceWords(contribution, onItem),
		correction: correctionWords(contribution, onItem),
		words: contribution.words,
		when: ukMeetingTime(contribution.createdAt)
	};
}

/** One item in the room for the meeting's page, read the same way while it is talked through and afterwards. */
export function itemRoomViewOf(record: MeetingRecord, item: AgendaItem, now: Date): ItemRoomView {
	const talk = itemTalkOf(record, item, now);
	const isOpen = talk.roundsLimit > 0;
	const said = talk.contributions.map((contribution) => contributionView(contribution, talk.contributions, record.directors));
	const outcome = outcomeOfItem(record.room ?? emptyMeetingRoom, item.id);
	if (!isOpen) return { isOpen, said, standing: roomNotOpenWords, outcome: null };
	if (outcome === null) return { isOpen, said, standing: talkingLine(talk, record.directors), outcome: null };
	return { isOpen, said, standing: outcomeLine(outcome, item), outcome: outcome.outcome };
}
