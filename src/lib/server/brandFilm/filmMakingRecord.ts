import type { FilmMaking, FilmMakingState } from '$lib/brand/film/filmMaking';

/** The table a brand's film requests are kept in (migration 0233). */
export const filmMakingsTable = 'brand_film_makings';

/** The columns a request is read from. */
export const filmMakingColumns = 'id, organisation_id, content_piece_id, asked_by, state, failure_reason, library_item_id, asked_at, finished_at';

/** A request as the site works it: the piece it is for and who asked, beside how it stands. */
export type FilmMakingRecord = FilmMaking & { organisationId: string; contentPieceId: string; askedBy: string | null };

export function filmMakingOfRow(row: Record<string, unknown>): FilmMakingRecord {
	return {
		id: row.id as string,
		organisationId: row.organisation_id as string,
		contentPieceId: row.content_piece_id as string,
		askedBy: (row.asked_by as string | null) ?? null,
		state: row.state as FilmMakingState,
		failureReason: (row.failure_reason as string | null) ?? null,
		libraryItemId: (row.library_item_id as string | null) ?? null,
		askedAt: row.asked_at as string,
		finishedAt: (row.finished_at as string | null) ?? null
	};
}
