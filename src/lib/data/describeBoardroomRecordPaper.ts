import { boardRecordSourceWords, recordPapersOfItem, type BoardroomRecordPaper } from './boardroomRecordPaper';
import { nameOfSeat } from './boardroomMeeting';
import { ukMeetingTime } from './ukMeetingTime';
import type { BoardroomDirector } from './boardroomDirector';

const paperIndent = '   ';

function asTaken(paper: BoardroomRecordPaper): string {
	return `${boardRecordSourceWords[paper.source]}, as it stood on ${ukMeetingTime(paper.takenAt)}`;
}

function recordPaperLine(paper: BoardroomRecordPaper, directors: BoardroomDirector[]): string {
	const addedBy = nameOfSeat(directors, paper.addedByDirectorId);
	return `${paperIndent}- Paper: ${paper.title} (${asTaken(paper)}, added by ${addedBy}; paper ${paper.id})`;
}

/** The papers taken from the records for one agenda item, a line each beneath it, as read_board_meeting lists them. */
export function recordPaperLinesOfItem(
	papers: BoardroomRecordPaper[],
	agendaItemId: string,
	directors: BoardroomDirector[]
): string[] {
	return recordPapersOfItem(papers, agendaItemId).map((paper) => recordPaperLine(paper, directors));
}

/** What a director's Claude reads of a paper taken from the records: the reading word for word, as the board saw it. */
export function describeRecordPaper(paper: BoardroomRecordPaper, directors: BoardroomDirector[]): string {
	const addedBy = nameOfSeat(directors, paper.addedByDirectorId);
	return [
		`${paper.title}: ${asTaken(paper)} (UK time), added by ${addedBy}.`,
		'This is the reading kept with the meeting. The records may read differently now; answer from this copy when the question is what the board saw.',
		'',
		paper.reading
	].join('\n');
}

export function recordPaperAdded(paper: { title: string; id: string; takenAt: string }, itemNumber: number): string {
	const kept = `"${paper.title}" is on item ${itemNumber} (paper ${paper.id}), kept as it stood on ${ukMeetingTime(paper.takenAt)} (UK time).`;
	return `${kept} Every director of the board can read it, and nothing in the records was changed by taking it.`;
}
