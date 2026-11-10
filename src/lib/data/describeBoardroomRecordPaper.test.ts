import { describe, expect, it } from 'vitest';
import { describeRecordPaper, recordPaperLinesOfItem } from './describeBoardroomRecordPaper';
import { nigelsSeat } from './boardroomMeeting.fixtures';
import type { BoardroomRecordPaper } from './boardroomRecordPaper';

const progress: BoardroomRecordPaper = {
	id: 'progress-paper',
	organisationId: 'ybt',
	meetingId: 'meeting',
	agendaItemId: 'item-1',
	source: 'project_progress',
	title: 'Where the portal stands',
	periodStart: null,
	periodEnd: null,
	costCentreId: null,
	recordId: 'portal',
	reading: '# Portal: On track',
	takenAt: '2026-11-11T10:00:00.000Z',
	addedByDirectorId: 'nigels-seat',
	addedBy: 'nigel'
};

describe('describing a paper taken from the records', () => {
	it('lists it under its item with where it was read from, when, and who added it', () => {
		const lines = recordPaperLinesOfItem([progress, { ...progress, agendaItemId: 'item-2' }], 'item-1', [nigelsSeat]);
		expect(lines).toEqual([
			"   - Paper: Where the portal stands (a project's progress, as it stood on 11 Nov 2026 at 10:00, added by Nigel; paper progress-paper)"
		]);
	});

	it('gives the reading word for word, said plainly to be the copy the board saw', () => {
		const text = describeRecordPaper(progress, [nigelsSeat]);
		expect(text).toContain("Where the portal stands: a project's progress, as it stood on 11 Nov 2026 at 10:00 (UK time), added by Nigel.");
		expect(text).toContain('The records may read differently now');
		expect(text.endsWith('# Portal: On track')).toBe(true);
	});
});
