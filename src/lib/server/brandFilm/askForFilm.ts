import { failFilmMaking } from './moveFilmMaking';
import { findContentPiece } from '$lib/server/brandContent/findContentPiece';
import { findItemStandings } from '$lib/server/brandLibrary/findItemStandings';
import { findLatestFilmMaking } from './findFilmMakings';
import { keepFilmMaking, type FilmAsker } from './keepFilmMaking';
import { libraryIdsOf } from '$lib/brand/content/checkDraftItems';
import { FilmMakingStates, problemWithMakingFilm } from '$lib/brand/film/filmMaking';
import { startFilmWorkflow } from './startFilmWorkflow';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { FilmMakingRecord } from './filmMakingRecord';
import type { SupabaseClient } from '@supabase/supabase-js';


/** The request kept and started, the piece not found, or why the video cannot be made. */
export type FilmAsking = { making: FilmMakingRecord } | { refusal: string } | { isNoSuchPiece: true };

/**
 * Asks for the piece's video: checked first, kept as waiting, then handed to GitHub's runner. When the runner cannot be
 * started, the request is kept as failed with the reason, so the piece says why rather than waiting for ever.
 */
export async function askForFilm(supabase: SupabaseClient, asker: FilmAsker): Promise<FilmAsking> {
	const { organisationId, contentPieceId } = asker;
	const found = await findContentPiece(supabase, organisationId, contentPieceId);
	if (found === null) return { isNoSuchPiece: true };
	const { piece } = found;
	const items = await findItemStandings(supabase, organisationId, libraryIdsOf(piece));
	const latest = await findLatestFilmMaking(supabase, organisationId, contentPieceId);
	const problem = problemWithMakingFilm(piece, items, latest);
	if (problem !== null) return { refusal: problem };
	const kept = await keepFilmMaking(supabase, asker);
	if (kept === null) return { refusal: `“${piece.title}” is already being made; its video shows on the piece when it is ready` };
	return { making: await startOrFail(kept) };
}

async function startOrFail(making: FilmMakingRecord): Promise<FilmMakingRecord> {
	const failureReason = await startFilmWorkflow(making.id);
	if (failureReason === null) return making;
	await failFilmMaking(supabaseServiceClient(), making.id, failureReason);
	return { ...making, state: FilmMakingStates.failed, failureReason };
}
