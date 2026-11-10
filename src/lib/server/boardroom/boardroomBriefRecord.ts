import type { BoardroomBrief, BriefIn } from '$lib/data/boardroomBrief';

export const boardroomBriefColumns =
	'id, organisation_id, meeting_id, agenda_item_id, director_id, version, position, may_share, must_not_share, must_come_back, created_at';

function textOrNull(value: unknown): string | null {
	if (value === null || value === undefined) return null;
	return String(value);
}

export function parseBoardroomBriefRecord(row: Record<string, unknown>): BoardroomBrief {
	return {
		id: row.id as string,
		organisationId: row.organisation_id as string,
		meetingId: row.meeting_id as string,
		agendaItemId: row.agenda_item_id as string,
		directorId: row.director_id as string,
		version: Number(row.version),
		position: String(row.position ?? ''),
		mayShare: textOrNull(row.may_share),
		mustNotShare: textOrNull(row.must_not_share),
		mustComeBack: textOrNull(row.must_come_back),
		createdAt: row.created_at as string
	};
}

export function parseBriefInRecord(row: Record<string, unknown>): BriefIn {
	return { agendaItemId: row.agenda_item_id as string, directorId: row.director_id as string };
}
