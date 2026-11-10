import { readAgendaPurpose } from '$lib/data/validateAgendaItem';
import type { AgendaItem, BoardroomMeeting } from '$lib/data/boardroomMeeting';

export const boardroomMeetingColumns =
	'id, organisation_id, meets_at, chair_director_id, called_by_director_id, called_at, opened_at, closed_at';

export const agendaItemColumns = 'id, meeting_id, position, title, purpose, is_any_other_business, withdrawn_at';

export function parseBoardroomMeetingRecord(row: Record<string, unknown>): BoardroomMeeting {
	return {
		id: row.id as string,
		organisationId: row.organisation_id as string,
		meetsAt: row.meets_at as string,
		chairDirectorId: row.chair_director_id as string,
		calledByDirectorId: row.called_by_director_id as string,
		calledAt: row.called_at as string,
		openedAt: (row.opened_at as string | null) ?? null,
		closedAt: (row.closed_at as string | null) ?? null
	};
}

export function parseAgendaItemRecord(row: Record<string, unknown>): AgendaItem {
	return {
		id: row.id as string,
		meetingId: row.meeting_id as string,
		position: Number(row.position),
		title: String(row.title ?? ''),
		purpose: readAgendaPurpose(row.purpose) ?? 'noting',
		isAnyOtherBusiness: row.is_any_other_business === true,
		withdrawnAt: (row.withdrawn_at as string | null) ?? null
	};
}
