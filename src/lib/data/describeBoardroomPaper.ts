import { describeByteCount } from './taskAttachmentRules';
import { boardPaperFileKinds, boardPaperUploadLinkLifetimeHours } from './boardroomPaperRules';
import { boardPaperKinds, papersOfItem, type BoardPaperFileGiven, type BoardroomPaper } from './boardroomPaper';
import { nameOfSeat } from './boardroomMeeting';
import { ukMeetingTime } from './ukMeetingTime';
import type { BoardroomDirector } from './boardroomDirector';

const paperIndent = '   ';

function whatItIs(paper: BoardroomPaper): string {
	if (paper.kind === boardPaperKinds.note) return 'a written note';
	const kind = boardPaperFileKinds[paper.mimeType ?? ''] ?? 'file';
	return `${kind}, ${paper.filename}, ${describeByteCount(paper.byteCount ?? 0)}`;
}

function paperLine(paper: BoardroomPaper, directors: BoardroomDirector[]): string {
	const addedBy = nameOfSeat(directors, paper.addedByDirectorId);
	return `${paperIndent}- Paper: ${paper.title} (${whatItIs(paper)}, added by ${addedBy}; paper ${paper.id})`;
}

/** The papers kept on one agenda item, a line each beneath it, as read_board_meeting lists them. */
export function paperLinesOfItem(papers: BoardroomPaper[], agendaItemId: string, directors: BoardroomDirector[]): string[] {
	return papersOfItem(papers, agendaItemId).map((paper) => paperLine(paper, directors));
}

/** What a director's Claude reads of a written note. */
export function describeNotePaper(paper: BoardroomPaper, directors: BoardroomDirector[]): string {
	const addedBy = nameOfSeat(directors, paper.addedByDirectorId);
	return [`${paper.title}: a written note added by ${addedBy} on ${ukMeetingTime(paper.createdAt)} (UK time).`, '', paper.note ?? ''].join('\n');
}

export function notePaperAdded(title: string, paperId: string, itemNumber: number): string {
	return `The note "${title}" is on item ${itemNumber} (paper ${paperId}). Every director of the board can read it, and nobody else.`;
}

export function paperUploadGranted(file: BoardPaperFileGiven, granted: { paperId: string; uploadUrl: string }, itemNumber: number): string {
	return [
		`Upload link for "${file.filename}" onto item ${itemNumber}, to be used once within ${boardPaperUploadLinkLifetimeHours} hours. ` +
			`Send the raw bytes as an HTTP PUT with content-type ${file.mimeType}, for example:`,
		`curl --fail --upload-file <path to the file> -H "content-type: ${file.mimeType}" "${granted.uploadUrl}"`,
		`Then call record_board_paper_upload with this organisationId and paperId ${granted.paperId}. ` +
			'The directors see the paper only once it is recorded.',
		'If your own network refuses the PUT, the link is not at fault and retrying will not help: tell the director.'
	].join('\n');
}

export function filePaperRecorded(paper: BoardroomPaper, byteCount: number): string {
	const kept = `"${paper.title}" (${paper.filename}, ${describeByteCount(byteCount)}) is kept with the meeting (paper ${paper.id}).`;
	return `${kept} Every director of the board can read it, and nobody else.`;
}

export const paperNotArrived = 'Nothing has arrived at that link yet. Send the file with the PUT first, then call again.';

export const paperLinkLapsed = 'That link lapsed before anything was sent to it. Call add_board_paper for a fresh one.';

export function paperAlreadyRecorded(paper: BoardroomPaper): string {
	return `"${paper.title}" is already kept with the meeting (paper ${paper.id}).`;
}

export function filePaperLink(paper: BoardroomPaper, link: string): string {
	return `${paper.title}: ${whatItIs(paper)}. Fetch it within ten minutes from:\n${link}`;
}
