import { papersOfItem, isFilePaper, type BoardroomPaper } from './boardroomPaper';
import { recordPapersOfItem, type BoardroomRecordPaper } from './boardroomRecordPaper';
import { nameOfSeat } from './boardroomMeeting';
import { whatItIs } from './describeBoardroomPaper';
import { asTaken } from './describeBoardroomRecordPaper';
import { boardPaperPathOf } from './boardroomPaths';
import type { MeetingRecord } from './describeBoardroomMeeting';

/** One paper as a meeting's page shows it: its text when it is written, or where to open it when it is a file. */
export type BoardPaperView = {
	id: string;
	title: string;
	whatItIs: string;
	addedByName: string;
	text: string | null;
	href: string | null;
};

function keptPaperView(record: MeetingRecord, paper: BoardroomPaper): BoardPaperView {
	const meeting = record.meeting;
	const isFile = isFilePaper(paper);
	return {
		id: paper.id,
		title: paper.title,
		whatItIs: whatItIs(paper),
		addedByName: nameOfSeat(record.directors, paper.addedByDirectorId),
		text: isFile ? null : (paper.note ?? ''),
		href: isFile ? boardPaperPathOf(meeting.organisationId, meeting.id, paper.id) : null
	};
}

function recordPaperView(record: MeetingRecord, paper: BoardroomRecordPaper): BoardPaperView {
	return {
		id: paper.id,
		title: paper.title,
		whatItIs: asTaken(paper),
		addedByName: nameOfSeat(record.directors, paper.addedByDirectorId),
		text: paper.reading,
		href: null
	};
}

/** The papers on one agenda item: the files and notes kept on it, then the readings taken from the records. */
export function paperViewsOfItem(record: MeetingRecord, agendaItemId: string): BoardPaperView[] {
	const kept = papersOfItem(record.papers, agendaItemId).map((paper) => keptPaperView(record, paper));
	const taken = recordPapersOfItem(record.recordPapers, agendaItemId).map((paper) => recordPaperView(record, paper));
	return [...kept, ...taken];
}
