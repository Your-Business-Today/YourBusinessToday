import { FilmMakingKinds, type FilmMaking, type FilmMakingKind, type FilmMakingState } from '$lib/brand/film/filmMaking';

/** The table a brand's film requests are kept in (migration 0233). */
export const filmMakingsTable = 'brand_film_makings';

/** The table each picture a request made is kept in, in shot order (migration 0234). */
export const filmMakingPicturesTable = 'brand_film_making_pictures';

/** Every column, so a request still reads in the moments before a new column's migration has run. */
export const filmMakingColumns = '*';

/** A request as the site works it: the piece it is for and who asked, beside how it stands. */
export type FilmMakingRecord = FilmMaking & { organisationId: string; contentPieceId: string; askedBy: string | null };

export function filmMakingOfRow(row: Record<string, unknown>): FilmMakingRecord {
	return {
		id: row.id as string,
		organisationId: row.organisation_id as string,
		contentPieceId: row.content_piece_id as string,
		askedBy: (row.asked_by as string | null) ?? null,
		kind: (row.kind as FilmMakingKind | undefined) ?? FilmMakingKinds.video,
		state: row.state as FilmMakingState,
		pictureItemIds: [],
		failureReason: (row.failure_reason as string | null) ?? null,
		libraryItemId: (row.library_item_id as string | null) ?? null,
		askedAt: row.asked_at as string,
		finishedAt: (row.finished_at as string | null) ?? null
	};
}
