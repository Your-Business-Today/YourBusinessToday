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
	read:
		'A written note comes back as its text. A file comes back as a link to fetch it from, good for ten minutes; fetch it ' +
		'then rather than passing the link on.'
} as const;
