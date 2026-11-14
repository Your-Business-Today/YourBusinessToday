import { filmMakingColumns, filmMakingOfRow, filmMakingsTable, type FilmMakingRecord } from './filmMakingRecord';
import { withPicturesMade } from './findPicturesMade';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The latest request for the piece's video or pictures, with every picture it made, or null when none was made. */
export async function findLatestFilmMaking(supabase: SupabaseClient, organisationId: string, contentPieceId: string): Promise<FilmMakingRecord | null> {
	const { data, error } = await supabase
		.from(filmMakingsTable)
		.select(filmMakingColumns)
		.eq('organisation_id', organisationId)
		.eq('content_piece_id', contentPieceId)
		.order('asked_at', { ascending: false })
		.limit(1)
		.maybeSingle();
	if (error) throw error;
	return data === null ? null : withPicturesMade(supabase, filmMakingOfRow(data));
}
