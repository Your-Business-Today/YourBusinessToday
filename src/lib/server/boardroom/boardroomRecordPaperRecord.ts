import { isBoardRecordSource, type BoardroomRecordPaper } from '$lib/data/boardroomRecordPaper';

function textOrNull(value: unknown): string | null {
	if (value === null || value === undefined) return null;
	return String(value);
}

export function parseBoardroomRecordPaperRecord(row: Record<string, unknown>): BoardroomRecordPaper {
	const source = row.source;
	if (!isBoardRecordSource(source)) throw new Error(`A board paper was read from an unknown source: ${source}`);
	return {
		id: row.id as string,
		organisationId: row.organisation_id as string,
		meetingId: row.meeting_id as string,
		agendaItemId: row.agenda_item_id as string,
		source,
		title: String(row.title ?? ''),
		periodStart: textOrNull(row.period_start),
		periodEnd: textOrNull(row.period_end),
		costCentreId: textOrNull(row.cost_centre_id),
		recordId: textOrNull(row.record_id),
		reading: String(row.reading ?? ''),
		takenAt: row.taken_at as string,
		addedByDirectorId: row.added_by_director_id as string,
		addedBy: textOrNull(row.added_by)
	};
}

/** The columns of boardroom_record_papers a paper is kept in. */
export function recordPaperColumns(paper: BoardroomRecordPaper): Record<string, unknown> {
	return {
		id: paper.id,
		organisation_id: paper.organisationId,
		meeting_id: paper.meetingId,
		agenda_item_id: paper.agendaItemId,
		source: paper.source,
		title: paper.title,
		period_start: paper.periodStart,
		period_end: paper.periodEnd,
		cost_centre_id: paper.costCentreId,
		record_id: paper.recordId,
		reading: paper.reading,
		taken_at: paper.takenAt,
		added_by_director_id: paper.addedByDirectorId,
		added_by: paper.addedBy
	};
}
