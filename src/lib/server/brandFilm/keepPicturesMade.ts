import { filmMakingPicturesTable, type FilmMakingRecord } from './filmMakingRecord';
import { firstShotNumber } from '$lib/brand/film/filmMaking';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';

/** Keeps the library item each shot's picture goes to on the request, in shot order; only the site writes these rows. */
export async function keepPicturesMade(making: FilmMakingRecord, itemIds: string[]): Promise<void> {
	const rows = itemIds.map((libraryItemId, index) => ({
		film_making_id: making.id,
		organisation_id: making.organisationId,
		shot_number: index + firstShotNumber,
		library_item_id: libraryItemId
	}));
	const { error } = await supabaseServiceClient().from(filmMakingPicturesTable).insert(rows);
	if (error) throw error;
}
