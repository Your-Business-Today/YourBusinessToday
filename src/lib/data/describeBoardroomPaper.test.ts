import { describe, expect, it } from 'vitest';
import { paperLinesOfItem, paperUploadGranted } from './describeBoardroomPaper';
import { nigelsSeat } from './boardroomMeeting.fixtures';
import type { BoardroomPaper } from './boardroomPaper';

const note: BoardroomPaper = {
	id: 'note-paper',
	organisationId: 'ybt',
	meetingId: 'meeting',
	agendaItemId: 'item-1',
	kind: 'note',
	title: 'Why the bank moved',
	note: 'Cash is up.',
	filename: null,
	mimeType: null,
	byteCount: null,
	storagePath: null,
	addedByDirectorId: 'nigels-seat',
	addedBy: 'nigel',
	expiresAt: null,
	recordedAt: '2026-11-11T10:00:00.000Z',
	createdAt: '2026-11-11T10:00:00.000Z'
};
const accounts: BoardroomPaper = {
	...note,
	id: 'file-paper',
	kind: 'file',
	title: 'Management accounts',
	note: null,
	filename: 'accounts.pdf',
	mimeType: 'application/pdf',
	byteCount: 2048,
	storagePath: 'ybt/meeting/file-paper/accounts.pdf'
};
const stillBeingSent: BoardroomPaper = { ...accounts, id: 'pending', byteCount: null, recordedAt: null };
const onAnotherItem: BoardroomPaper = { ...note, id: 'elsewhere', agendaItemId: 'item-2' };

describe("an agenda item's papers as read_board_meeting lists them", () => {
	it('lists each kept paper beneath its item, with who added it and its id, and leaves out a file still being sent', () => {
		const lines = paperLinesOfItem([note, accounts, stillBeingSent, onAnotherItem], 'item-1', [nigelsSeat]);
		expect(lines).toEqual([
			'   - Paper: Why the bank moved (a written note, added by Nigel; paper note-paper)',
			'   - Paper: Management accounts (PDF, accounts.pdf, 2 KB, added by Nigel; paper file-paper)'
		]);
	});

	it('tells the Claude how to send a granted file and to record it after', () => {
		const file = { filename: 'accounts.pdf', mimeType: 'application/pdf', byteCount: 2048 };
		const answer = paperUploadGranted(file, { paperId: 'file-paper', uploadUrl: 'https://files.example/upload' }, 2);
		expect(answer).toContain('onto item 2');
		expect(answer).toContain('-H "content-type: application/pdf" "https://files.example/upload"');
		expect(answer).toContain('paperId file-paper');
	});
});
