import { boardPaperFileKinds, boardPaperUploadLinkLifetimeHours } from '$lib/data/boardroomPaperRules';

const fileKindWords = Object.values(boardPaperFileKinds).join(', ');

/** What a Claude is told before it runs each Boardroom paper action. */
export const boardroomPaperGuidance = {
	add:
		'Read the meeting first with read_board_meeting, and name the item by its number now. A paper is a written note, given ' +
		`in note, or a file (${fileKindWords}, up to 25 MB), described by filename, mimeType and byteCount. A note is kept at ` +
		`once. A file gets a one-time upload link that lasts ${boardPaperUploadLinkLifetimeHours} hours: send it with one HTTP ` +
		'PUT, then call record_board_paper_upload, and only then do the directors see it. Every sitting director of the board ' +
		'reads every paper, and nobody else does; nothing deletes one. Papers go on until the meeting closes. Add a paper only on ' +
		'the director’s word, and never one holding passwords or keys.',
	record:
		'Call this once the PUT has succeeded. The paper is kept at the size that actually arrived, and read_board_meeting then ' +
		'lists it under its item.',
	fromRecords:
		'Read the meeting first with read_board_meeting, and name the item by its number now. The paper is read now from what ' +
		'Your Business Today holds for the organisation: the trial balance or balance sheet at the end of asAt, the profit and loss ' +
		'from periodStart to periodEnd, the progress of one of its projects (projectId), or a page of its Your Business Brain ' +
		'(pageId). It is kept word for word as it stood, with the moment it was taken, so the minutes match what the board saw. ' +
		'Books and Your Business Brain papers are offered only when that module is switched on for the organisation and for ' +
		'the director. Nothing in the records is changed by taking it. Add a paper only on the director’s word.',
	read:
		'A written note comes back as its text, and a paper taken from the records as the reading kept with the meeting. A file ' +
		'comes back as a link to fetch it from, good for ten minutes; fetch it then rather than passing the link on.'
} as const;
