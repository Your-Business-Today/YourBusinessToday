import { filmMakingPicturesTable, type FilmMakingRecord } from './filmMakingRecord';
import { FilmMakingKinds } from '$lib/brand/film/filmMaking';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The request with the library item of every picture it made, in shot order; a video's request makes none. */
export async function withPicturesMade(supabase: SupabaseClient, making: FilmMakingRecord): Promise<FilmMakingRecord> {
	if (making.kind !== FilmMakingKinds.pictures) return making;
	const { data, error } = await supabase
		.from(filmMakingPicturesTable)
		.select('library_item_id')
		.eq('film_making_id', making.id)
		.order('shot_number');
	if (error) throw error;
	return { ...making, pictureItemIds: (data ?? []).map((row) => row.library_item_id as string) };
}
