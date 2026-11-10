import { boardPaperKinds, type BoardroomPaper } from '$lib/data/boardroomPaper';

function textOrNull(value: unknown): string | null {
	if (value === null || value === undefined) return null;
	return String(value);
}

function numberOrNull(value: unknown): number | null {
	if (value === null || value === undefined) return null;
	return Number(value);
}

export function parseBoardroomPaperRecord(row: Record<string, unknown>): BoardroomPaper {
	return {
		id: row.id as string,
		organisationId: row.organisation_id as string,
		meetingId: row.meeting_id as string,
		agendaItemId: row.agenda_item_id as string,
		kind: row.kind === boardPaperKinds.file ? boardPaperKinds.file : boardPaperKinds.note,
		title: String(row.title ?? ''),
		note: textOrNull(row.note),
		filename: textOrNull(row.filename),
		mimeType: textOrNull(row.mime_type),
		byteCount: numberOrNull(row.byte_count),
		storagePath: textOrNull(row.storage_path),
		addedByDirectorId: row.added_by_director_id as string,
		addedBy: textOrNull(row.added_by),
		expiresAt: textOrNull(row.expires_at),
		recordedAt: textOrNull(row.recorded_at),
		createdAt: row.created_at as string
	};
}
