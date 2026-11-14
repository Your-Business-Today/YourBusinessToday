import { filmMakingColumns, filmMakingOfRow, filmMakingsTable, type FilmMakingRecord } from './filmMakingRecord';
import { withPicturesMade } from './findPicturesMade';
import { hashSecret } from '$lib/server/oauth/oauthTokens';
import { FilmMakingStates } from '$lib/brand/film/filmMaking';
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

/** The request of that id, with every picture it made, or null. */
export async function findFilmMaking(supabase: SupabaseClient, filmMakingId: string): Promise<FilmMakingRecord | null> {
	const { data, error } = await supabase.from(filmMakingsTable).select(filmMakingColumns).eq('id', filmMakingId).maybeSingle();
	if (error) throw error;
	return data === null ? null : withPicturesMade(supabase, filmMakingOfRow(data));
}

/** The request being filmed under that token, or null once it is filmed or when no request holds it. */
export async function findFilmingByToken(supabase: SupabaseClient, token: string): Promise<FilmMakingRecord | null> {
	const { data, error } = await supabase
		.from(filmMakingsTable)
		.select(filmMakingColumns)
		.eq('filming_token_hash', hashSecret(token))
		.eq('state', FilmMakingStates.filming)
		.maybeSingle();
	if (error) throw error;
	return data === null ? null : filmMakingOfRow(data);
}
