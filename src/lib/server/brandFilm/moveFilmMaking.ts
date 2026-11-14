import { filmMakingsTable } from './filmMakingRecord';
import { FilmMakingStates, type FilmMakingState } from '$lib/brand/film/filmMaking';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';

/** What a request becomes as it moves on, from the state it must be in. Only the site moves a request, never its asker. */
type FilmMakingMove = {
	from: FilmMakingState[];
	columns: Record<string, unknown>;
};

async function moveFilmMaking(filmMakingId: string, move: FilmMakingMove): Promise<boolean> {
	const { data, error } = await supabaseServiceClient().from(filmMakingsTable).update(move.columns).eq('id', filmMakingId).in('state', move.from).select('id');
	if (error) throw error;
	return (data ?? []).length > 0;
}

const openStates: FilmMakingState[] = [FilmMakingStates.waiting, FilmMakingStates.filming];

/** The user's Claude has the recipe: what it makes goes to the granted library item. */
export function startFilming(filmMakingId: string, libraryItemId: string) {
	const columns = { state: FilmMakingStates.filming, library_item_id: libraryItemId, started_at: new Date().toISOString() };
	return moveFilmMaking(filmMakingId, { from: [FilmMakingStates.waiting], columns });
}

/** What was made arrived in the library. */
export function finishFilming(filmMakingId: string) {
	const columns = { state: FilmMakingStates.ready, finished_at: new Date().toISOString() };
	return moveFilmMaking(filmMakingId, { from: [FilmMakingStates.filming], columns });
}

/** The request failed, for the reason given. */
export function failFilmMaking(filmMakingId: string, failureReason: string) {
	const columns = { state: FilmMakingStates.failed, failure_reason: failureReason, finished_at: new Date().toISOString() };
	return moveFilmMaking(filmMakingId, { from: openStates, columns });
}
