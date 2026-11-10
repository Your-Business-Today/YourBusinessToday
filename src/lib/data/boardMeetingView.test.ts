import { describe, expect, it } from 'vitest';
import { boardMeetingViewOf } from './boardMeetingView';
import { agendaItem, calledMeeting, dayBeforeTheMeeting, formerSeat, jeremysSeat, meetingId, nigelsSeat } from './boardroomMeeting.fixtures';
import type { BoardroomPaper } from './boardroomPaper';
import type { BoardroomRecordPaper } from './boardroomRecordPaper';
import type { MeetingRecord } from './describeBoardroomMeeting';

const note = {
	id: 'note-paper',
	agendaItemId: 'item-1',
	kind: 'note',
	title: 'Why the bank moved',
	note: 'Cash is up.',
	filename: null,
	mimeType: null,
	byteCount: null,
	storagePath: null,
	addedByDirectorId: 'jeremys-seat',
	recordedAt: '2026-11-11T10:00:00.000Z'
} as BoardroomPaper;
const accounts = {
	...note,
	id: 'file-paper',
	kind: 'file',
	title: 'Management accounts',
	note: null,
	filename: 'accounts.pdf',
	mimeType: 'application/pdf',
	byteCount: 2048,
	storagePath: 'ybt/meeting/file-paper/accounts.pdf'
} as BoardroomPaper;
const stillBeingSent = { ...accounts, id: 'pending', recordedAt: null } as BoardroomPaper;
const progress = {
	id: 'progress-paper',
	agendaItemId: 'item-2',
	source: 'project_progress',
	title: 'Where the portal stands',
	reading: '# Portal: On track',
	takenAt: '2026-11-11T10:00:00.000Z',
	addedByDirectorId: 'nigels-seat'
} as BoardroomRecordPaper;

const record: MeetingRecord = {
	meeting: calledMeeting,
	directors: [nigelsSeat, jeremysSeat, formerSeat],
	items: [agendaItem(1), agendaItem(2), agendaItem(3, '2026-11-11T09:00:00.000Z')],
	papers: [note, accounts, stillBeingSent],
	recordPapers: [progress]
};

describe("a meeting's own page", () => {
	const view = boardMeetingViewOf(record, dayBeforeTheMeeting);

	it('shows when it meets, where it stands, who chairs it, who called it and the directors on it', () => {
		expect(view).toMatchObject({
			id: meetingId,
			when: '12 Nov 2026 at 10:00',
			stage: 'called',
			chairName: 'Jeremy',
			calledByName: 'Nigel',
			directorNames: ['Nigel', 'Jeremy']
		});
	});

	it('numbers the standing agenda from 1 and keeps the withdrawn items apart', () => {
		expect(view.agenda.map((item) => [item.number, item.title, item.purposeWords])).toEqual([
			[1, 'Item 1', 'to note'],
			[2, 'Item 2', 'to note']
		]);
		expect(view.withdrawnTitles).toEqual(['Item 3']);
	});

	it("shows a note's text, opens a file through its own path, and leaves out a file still being sent", () => {
		const [noteView, fileView] = view.agenda[0].papers;
		expect(view.agenda[0].papers).toHaveLength(2);
		expect(noteView).toMatchObject({ title: 'Why the bank moved', text: 'Cash is up.', href: null, addedByName: 'Jeremy' });
		expect(fileView.href).toBe(`/organisations/ybt/boardroom/${meetingId}/papers/file-paper`);
		expect(fileView.text).toBeNull();
	});

	it('shows a paper from the records word for word, with where it was read from', () => {
		const [progressView] = view.agenda[1].papers;
		expect(progressView.text).toBe('# Portal: On track');
		expect(progressView.whatItIs).toContain("a project's progress");
	});
});
