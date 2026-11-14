import { filmMakingsTable } from './filmMakingRecord';
import { FilmMakingStates, type FilmMakingState } from '$lib/brand/film/filmMaking';
import type { SupabaseClient } from '@supabase/supabase-js';

/** What a request becomes as it moves on, from the state it must be in. */
type FilmMakingMove = { from: FilmMakingState[]; columns: Record<string, unknown> };

async function moveFilmMaking(supabase: SupabaseClient, filmMakingId: string, move: FilmMakingMove): Promise<boolean> {
	const { data, error } = await supabase
		.from(filmMakingsTable)
		.update(move.columns)
		.eq('id', filmMakingId)
		.in('state', move.from)
		.select('id');
	if (error) throw error;
	return (data ?? []).length > 0;
}

const openStates: FilmMakingState[] = [FilmMakingStates.waiting, FilmMakingStates.filming];

/** The runner has the request: its page opens under the token's hash, and its video goes to the granted library item. */
export function startFilming(supabase: SupabaseClient, filmMakingId: string, filming: { tokenHash: string; libraryItemId: string }) {
	const columns = {
		state: FilmMakingStates.filming,
		filming_token_hash: filming.tokenHash,
		library_item_id: filming.libraryItemId,
		started_at: new Date().toISOString()
	};
	return moveFilmMaking(supabase, filmMakingId, { from: [FilmMakingStates.waiting], columns });
}

/** The video arrived in the library; the film's page no longer opens. */
export function finishFilming(supabase: SupabaseClient, filmMakingId: string) {
	const columns = { state: FilmMakingStates.ready, filming_token_hash: null, finished_at: new Date().toISOString() };
	return moveFilmMaking(supabase, filmMakingId, { from: [FilmMakingStates.filming], columns });
}

/** The request failed, for the reason given; the film's page no longer opens. */
export function failFilmMaking(supabase: SupabaseClient, filmMakingId: string, failureReason: string) {
	const columns = { state: FilmMakingStates.failed, failure_reason: failureReason, filming_token_hash: null, finished_at: new Date().toISOString() };
	return moveFilmMaking(supabase, filmMakingId, { from: openStates, columns });
}
