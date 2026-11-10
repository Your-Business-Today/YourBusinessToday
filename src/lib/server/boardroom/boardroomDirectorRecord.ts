import type { BoardroomDirector } from '$lib/data/boardroomDirector';

export const boardroomDirectorColumns = 'id, organisation_id, account_id, director_name, named_at, stood_down_at';

export function parseBoardroomDirectorRecord(row: Record<string, unknown>): BoardroomDirector {
	return {
		id: row.id as string,
		organisationId: row.organisation_id as string,
		accountId: (row.account_id as string | null) ?? null,
		name: String(row.director_name ?? ''),
		namedAt: row.named_at as string,
		stoodDownAt: (row.stood_down_at as string | null) ?? null
	};
}
