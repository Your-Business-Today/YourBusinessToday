import type { RecordsColumn } from '$lib/components/workspace/recordsTable';
import type { BoardMeetingRow } from '$lib/data/boardMeetingRows';

/** The meetings table's columns: the chair and the agenda's length give way on a phone. */
export const boardMeetingColumns: RecordsColumn<BoardMeetingRow>[] = [
	{ key: 'when', label: 'Meets (UK time)', sortValue: (row) => row.meetsAt },
	{ key: 'stage', label: 'Stage', sortValue: (row) => row.stage },
	{ key: 'chair', label: 'Chair', isWideOnly: true, sortValue: (row) => row.chairName },
	{ key: 'items', label: 'Agenda items', isFigure: true, isWideOnly: true, sortValue: (row) => row.itemCount }
];
