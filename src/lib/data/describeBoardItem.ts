import { ukMeetingTime } from './ukMeetingTime';
import { paperLinesOfItem } from './describeBoardroomPaper';
import { recordPaperLinesOfItem } from './describeBoardroomRecordPaper';
import { briefWordLines } from './describeBoardroomBrief';
import { agendaPurposeWords, type MeetingRecord } from './describeBoardroomMeeting';
import { latestOwnBrief } from './boardroomBrief';
import { outcomeKinds, type BoardContribution, type ItemOutcome } from './boardroomRoom';
import { isStillToSpeak, type ItemTalk } from './boardroomRoomTurns';
import { numberOf, saidSoFarLines } from './describeBoardContribution';
import { outcomeLine, positionLines, talkingLine } from './describeBoardroomRoom';
import { seatControlLines } from './describeSeatControls';
import { decisionLines } from './describeBoardDecision';
import type { AgendaItem } from './boardroomMeeting';
import type { DecisionOnItem } from './boardDecisionOnItem';

/** One item as a director's Claude reads it in the room: the item, its number now, and what is known of it. */
export type ItemReading = {
	record: MeetingRecord;
	item: AgendaItem;
	itemNumber: number;
	talk: ItemTalk;
	outcome: ItemOutcome | null;
	seatId: string | null;
	decision?: DecisionOnItem | null;
};

function papersLines({ record, item }: ItemReading): string[] {
	const papers = paperLinesOfItem(record.papers, item.id, record.directors);
	const recordPapers = recordPaperLinesOfItem(record.recordPapers, item.id, record.directors);
	const all = [...papers, ...recordPapers];
	if (all.length === 0) return ['Papers: none.'];
	return ['Papers (read one with read_board_paper):', ...all];
}

function ownBriefLines({ record, item }: ItemReading): string[] {
	const briefing = record.briefing;
	const brief = briefing === undefined ? null : latestOwnBrief(briefing, item.id);
	if (brief === null) return ['Your director has not briefed you on this item. Ask them before you take a stance.'];
	return [`Your director’s brief, version ${brief.version} (only you read it; never repeat what it says to keep back):`, ...briefWordLines(brief)];
}

function turnLine({ talk, seatId }: ItemReading): string {
	if (seatId === null) return 'You have no seat on this meeting, so you only read.';
	const isYourTurn = isStillToSpeak(talk, seatId);
	if (isYourTurn) return 'It is your turn: speak with speak_on_board_item.';
	return 'Your Claude has spoken this round; it speaks again once the others have had their turn.';
}

function standingLines(reading: ItemReading): string[] {
	const { record, talk, outcome, item } = reading;
	if (talk.roundsLimit === 0) return ['The room has not been opened yet; open it with open_board_room once the meeting’s time has come.'];
	if (outcome === null) return [`Where it stands: ${talkingLine(talk, record.directors)}`, turnLine(reading)];
	const came = `Where it stands: ${outcomeLine(outcome, item)}`;
	if (outcome.outcome === outcomeKinds.agreed) return [came];
	return [came, ...positionLines(talk, record.directors)];
}

/** read_board_item: the item, its papers, the reader's own brief, everything said on it, and where it stands. */
export function describeBoardItem(organisationName: string, reading: ItemReading): string {
	const { record, item, itemNumber, talk } = reading;
	const { meeting } = record;
	const when = ukMeetingTime(meeting.meetsAt);
	const heading = `Item ${itemNumber} of the board meeting of ${organisationName}, ${when} (UK time): ${item.title} — ${agendaPurposeWords[item.purpose]}.`;
	const said = saidSoFarLines(talk.contributions, record.directors);
	const ownDirector = [...ownBriefLines(reading), ...seatControlLines(record.controls, item.id)];
	const decision = decisionLines(reading.decision ?? null, record.directors);
	return [heading, '', ...papersLines(reading), '', ...ownDirector, '', ...said, '', ...standingLines(reading), ...decision].join('\n');
}

/** The answer when a contribution is kept: its number and round, and where the item stands now. */
export function describeContributionKept(reading: ItemReading, kept: BoardContribution): string {
	const { talk } = reading;
	const number = numberOf(talk.contributions, kept.id);
	const said = `Kept as contribution ${number} on item ${reading.itemNumber}, in round ${kept.round}.`;
	const forever = 'Nothing said in the room is changed or deleted; a correction is a new contribution naming this one.';
	return [`${said} ${forever}`, '', ...standingLines(reading)].join('\n');
}
