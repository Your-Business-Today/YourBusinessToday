import { maxAttachmentByteCount, maxAttachmentFilenameLength } from './taskAttachmentRules';
import { spreadsheetMimeType, wordDocumentMimeType } from './officeMimeTypes';

const presentationMimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

/** The kinds of file a board reads, by type, with the words a director knows them by; migration 0160 holds the same list. */
export const boardPaperFileKinds: Record<string, string> = {
	'application/pdf': 'PDF',
	[wordDocumentMimeType]: 'Word document',
	[spreadsheetMimeType]: 'Excel workbook',
	[presentationMimeType]: 'PowerPoint deck',
	'text/plain': 'text file',
	'text/csv': 'CSV',
	'text/markdown': 'Markdown',
	'image/png': 'PNG image',
	'image/jpeg': 'JPEG image'
};

/** The limits of boardroom_agenda_papers (migration 0160), stated once for the service and any form. */
export const boardPaperLimits = {
	longestTitle: 200,
	longestNote: 20000,
	longestFilename: maxAttachmentFilenameLength,
	largestByteCount: maxAttachmentByteCount
} as const;

/** Storage keeps a signed upload link open for two hours, and the grant says so. */
export const boardPaperUploadLinkLifetimeHours = 2;

const { longestTitle, longestNote, longestFilename, largestByteCount } = boardPaperLimits;
const largestMegabytes = largestByteCount / (1024 * 1024);
const fileKindTypes = Object.keys(boardPaperFileKinds).join(', ');

export const boardPaperRefusals = {
	itemNumberNotANumber: 'itemNumber is the number of an agenda item as read_board_meeting gives it now: a whole number from 1.',
	titleMissing: `title says what the paper is, such as "Management accounts to 31 October": required, at most ${longestTitle} characters.`,
	noteOrFile: 'Give either note, for a written note, or filename, mimeType and byteCount, for a file; not both.',
	noteTooLong: `A written note is at most ${longestNote} characters; send a longer paper as a file.`,
	filenameMissing: `filename is what the file is called, such as accounts-october-2026.pdf: required, at most ${longestFilename} characters.`,
	mimeTypeNotAPaper: `mimeType is the kind of file, one of ${fileKindTypes}. A board paper of any other kind is refused.`,
	byteCountOutOfRange: `byteCount is the size of the file in bytes: a whole number from 1 up to ${largestByteCount} (${largestMegabytes} MB).`,
	itemNotOnAgenda: 'That number is not an item on the agenda as read_board_meeting gives it now.',
	meetingHasClosed: 'The meeting has closed; its papers are kept as they stood.',
	callerHasNoSeat: 'Only a sitting director of the board adds a paper to its meetings.',
	noSuchPaper: 'No paper on this organisation’s board meetings has that id. Read the meeting with read_board_meeting for its papers.',
	noSuchUpload: 'No upload link with that paperId was granted to you on this board. Call add_board_paper for one.'
} as const;

export function isBoardPaperFileKind(mimeType: string): boolean {
	return Object.hasOwn(boardPaperFileKinds, mimeType);
}

export function isFittingPaperByteCount(byteCount: unknown): byteCount is number {
	if (typeof byteCount !== 'number' || !Number.isInteger(byteCount)) return false;
	return byteCount >= 1 && byteCount <= largestByteCount;
}

export function isFittingPaperText(text: string, longest: number): boolean {
	return text.length >= 1 && text.length <= longest;
}
