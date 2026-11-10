import { directorsOnMeeting, meetingStage, nameOfSeat, standingAgenda, type AgendaItem, type MeetingStage } from './boardroomMeeting';
import { agendaPurposeWords, type MeetingRecord } from './describeBoardroomMeeting';
import { paperViewsOfItem, type BoardPaperView } from './boardPaperViews';
import { itemBriefingViewOf, type ItemBriefingView } from './boardBriefViews';
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
};

/** One meeting as its own page shows it: when, who chairs it, who is on it, its agenda and each item's papers. */
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
};

function agendaItemView(record: MeetingRecord, item: AgendaItem, index: number, now: Date): BoardAgendaItemView {
	return {
		id: item.id,
		number: index + 1,
		title: item.title,
		purposeWords: agendaPurposeWords[item.purpose],
		isAnyOtherBusiness: item.isAnyOtherBusiness,
		papers: paperViewsOfItem(record, item.id),
		briefing: itemBriefingViewOf(record, item.id, now)
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
		withdrawnTitles: withdrawnTitlesOf(record.items)
	};
}
