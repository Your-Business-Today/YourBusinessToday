/** What a paper is: a file sent through a signed link, or a note written in the call. */
export type BoardPaperKind = 'file' | 'note';

export const boardPaperKinds = { file: 'file', note: 'note' } as const;

/** A file as a director's Claude describes it before it is sent. */
export type BoardPaperFileGiven = { filename: string; mimeType: string; byteCount: number };

/** What a paper holds: the note as written, or the file as described. */
export type BoardPaperContent = { kind: 'note'; note: string } | ({ kind: 'file' } & BoardPaperFileGiven);

/** A paper as a director gives it: the agenda item by its number now, its title and what it holds. */
export type BoardPaperDraft = { itemNumber: number; title: string; content: BoardPaperContent };

/** One paper on an agenda item, as kept: a note at once, a file once it has arrived (recordedAt set). */
export type BoardroomPaper = {
	id: string;
	organisationId: string;
	meetingId: string;
	agendaItemId: string;
	kind: BoardPaperKind;
	title: string;
	note: string | null;
	filename: string | null;
	mimeType: string | null;
	byteCount: number | null;
	storagePath: string | null;
	addedByDirectorId: string;
	addedBy: string | null;
	expiresAt: string | null;
	recordedAt: string | null;
	createdAt: string;
};

/** A file paper with everything a file has: its name, type and where it is stored. */
export type BoardroomFilePaper = BoardroomPaper & { filename: string; mimeType: string; storagePath: string };

export function isKept(paper: BoardroomPaper): boolean {
	return paper.recordedAt !== null;
}

export function isFilePaper(paper: BoardroomPaper): paper is BoardroomFilePaper {
	return paper.kind === boardPaperKinds.file && paper.storagePath !== null;
}

/** The papers kept on one agenda item, in the order they were added. */
export function papersOfItem(papers: BoardroomPaper[], agendaItemId: string): BoardroomPaper[] {
	return papers.filter((paper) => paper.agendaItemId === agendaItemId && isKept(paper));
}
