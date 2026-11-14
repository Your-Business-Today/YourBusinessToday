import { filmMakingPicturesTable, type FilmMakingRecord } from './filmMakingRecord';
import { firstShotNumber } from '$lib/brand/film/filmMaking';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Keeps the library item each shot's picture goes to on the request, in shot order. */
export async function keepPicturesMade(supabase: SupabaseClient, making: FilmMakingRecord, itemIds: string[]): Promise<void> {
	const rows = itemIds.map((libraryItemId, index) => ({
		film_making_id: making.id,
		organisation_id: making.organisationId,
		shot_number: index + firstShotNumber,
		library_item_id: libraryItemId
	}));
	const { error } = await supabase.from(filmMakingPicturesTable).insert(rows);
	if (error) throw error;
}
