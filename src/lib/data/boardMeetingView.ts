import { directorsOnMeeting, meetingStage, nameOfSeat, standingAgenda, type AgendaItem, type MeetingStage } from './boardroomMeeting';
import { agendaPurposeWords, type MeetingRecord } from './describeBoardroomMeeting';
import { paperViewsOfItem, type BoardPaperView } from './boardPaperViews';
import { itemBriefingViewOf, type ItemBriefingView } from './boardBriefViews';
import { itemRoomViewOf, type ItemRoomView } from './boardRoomViews';
import { heldPieceViewOf, ownClaudeViewOf, type HeldPieceView, type OwnClaudeView } from './boardSeatControlViews';
import { ukMeetingTime } from './ukMeetingTime';

/** One item on the agenda as a meeting's page shows it, numbered as the directors' Claudes number it. */
export type BoardAgendaItemView = {
	id: string;
	number: number;
	title: string;
	purposeWords: string;
	isAnyOtherBusiness: boolean;
	papers: BoardPaperView[];
	briefing: ItemBriefingView;
	room: ItemRoomView;
	held: HeldPieceView | null;
};

/** One meeting as its own page shows it: when, who chairs it, who is on it, its agenda, each item's papers and room, and the reader's own Claude. */
export type BoardMeetingView = {
	id: string;
	when: string;
	stage: MeetingStage;
	chairName: string;
	calledByName: string;
	calledWhen: string;
	directorNames: string[];
	agenda: BoardAgendaItemView[];
	withdrawnTitles: string[];
	ownClaude: OwnClaudeView | null;
};

function agendaItemView(record: MeetingRecord, item: AgendaItem, index: number, now: Date): BoardAgendaItemView {
	return {
		id: item.id,
		number: index + 1,
		title: item.title,
		purposeWords: agendaPurposeWords[item.purpose],
		isAnyOtherBusiness: item.isAnyOtherBusiness,
		papers: paperViewsOfItem(record, item.id),
		briefing: itemBriefingViewOf(record, item.id, now),
		room: itemRoomViewOf(record, item, now),
		held: heldPieceViewOf(record, item)
	};
}

function withdrawnTitlesOf(items: AgendaItem[]): string[] {
	return items.filter((item) => item.withdrawnAt !== null).map((item) => item.title);
}

export function boardMeetingViewOf(record: MeetingRecord, now: Date): BoardMeetingView {
	const { meeting, directors } = record;
	const agenda = standingAgenda(record.items).map((item, index) => agendaItemView(record, item, index, now));
	return {
		id: meeting.id,
		when: ukMeetingTime(meeting.meetsAt),
		stage: meetingStage(meeting, now),
		chairName: nameOfSeat(directors, meeting.chairDirectorId),
		calledByName: nameOfSeat(directors, meeting.calledByDirectorId),
		calledWhen: ukMeetingTime(meeting.calledAt),
		directorNames: directorsOnMeeting(directors, meeting, now).map((director) => director.name),
		agenda,
		withdrawnTitles: withdrawnTitlesOf(record.items),
		ownClaude: ownClaudeViewOf(record, now)
	};
}
