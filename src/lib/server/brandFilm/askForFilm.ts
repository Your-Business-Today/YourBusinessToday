import { failFilmMaking } from './moveFilmMaking';
import { findContentPiece } from '$lib/server/brandContent/findContentPiece';
import { findItemStandings } from '$lib/server/brandLibrary/findItemStandings';
import { findLatestFilmMaking } from './findFilmMakings';
import { FilmMakingStates, isFilmMakingStale, problemWithMakingFilm, staleFilmMakingReason, type FilmMakingKind } from '$lib/brand/film/filmMaking';
import { keepFilmMaking, type FilmAsker } from './keepFilmMaking';
import { libraryIdsOf } from '$lib/brand/content/checkDraftItems';
import { openFilmMaking } from './openFilmMaking';
import { problemWithMakingPictures } from '$lib/brand/film/pictureMaking';
import type { FilmMakingRecord } from './filmMakingRecord';
import type { FilmOrder } from '$lib/brand/film/filmOrder';
import { filmShapeForMedium, type FilmShape } from '$lib/brand/film/filmFrame';
import type { SupabaseClient } from '@supabase/supabase-js';

const problemFor: Record<FilmMakingKind, typeof problemWithMakingFilm> = { video: problemWithMakingFilm, pictures: problemWithMakingPictures };

/** The request opened with what to make, kept as failed with why, the piece not found, or why it cannot be made. */
export type FilmAsking = { making: FilmMakingRecord; order: FilmOrder | null } | { refusal: string } | { isNoSuchPiece: true };

/**
 * Asks for the piece's video, or its pictures, to be made by the asker's own Claude: checked first, kept, then opened with
 * the links its files come from and go to, in the shape given or its medium's. A request left open past its links is
 * closed first, so it never blocks a new one.
 */
export async function askForFilm(supabase: SupabaseClient, asker: FilmAsker, shapeGiven: FilmShape | null): Promise<FilmAsking> {
	const { organisationId, contentPieceId } = asker;
	const found = await findContentPiece(supabase, organisationId, contentPieceId);
	if (found === null) return { isNoSuchPiece: true };
	const { piece } = found;
	const items = await findItemStandings(supabase, organisationId, libraryIdsOf(piece));
	const latest = await closedIfStale(await findLatestFilmMaking(supabase, organisationId, contentPieceId));
	const problem = problemFor[asker.kind](piece, items, latest);
	if (problem !== null) return { refusal: problem };
	const kept = await keepFilmMaking(supabase, asker);
	if (kept === null) return { refusal: `“${piece.title}” is already being made; what it makes shows on the piece when it is ready` };
	const shape = shapeGiven ?? filmShapeForMedium(piece.mediumPath);
	const opening = await openFilmMaking(supabase, kept, piece, shape);
	if ('problem' in opening) return { making: { ...kept, state: FilmMakingStates.failed, failureReason: opening.problem }, order: null };
	return { making: { ...kept, state: FilmMakingStates.filming }, order: opening.order };
}

async function closedIfStale(latest: FilmMakingRecord | null): Promise<FilmMakingRecord | null> {
	const isStale = isFilmMakingStale(latest, new Date());
	if (!isStale || latest === null) return latest;
	await failFilmMaking(latest.id, staleFilmMakingReason);
	return { ...latest, state: FilmMakingStates.failed, failureReason: staleFilmMakingReason };
}
