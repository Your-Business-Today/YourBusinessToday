import { filmMakingColumns, filmMakingOfRow, filmMakingsTable, type FilmMakingRecord } from './filmMakingRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Who asks for the video, and of which brand's piece. */
export type FilmAsker = { organisationId: string; accountId: string; contentPieceId: string };

const alreadyAskedCode = '23505';

/** Keeps the request as waiting, or null when the piece already has one waiting or filming. */
export async function keepFilmMaking(supabase: SupabaseClient, asker: FilmAsker): Promise<FilmMakingRecord | null> {
	const row = { organisation_id: asker.organisationId, content_piece_id: asker.contentPieceId, asked_by: asker.accountId };
	const { data, error } = await supabase.from(filmMakingsTable).insert(row).select(filmMakingColumns).single();
	const isAlreadyAsked = error?.code === alreadyAskedCode;
	if (isAlreadyAsked) return null;
	if (error) throw error;
	return filmMakingOfRow(data);
}
