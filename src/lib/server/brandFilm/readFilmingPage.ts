import { findContentPiece } from '$lib/server/brandContent/findContentPiece';
import { findFilmingByToken } from './findFilmMakings';
import { FilmMakingKinds } from '$lib/brand/film/filmMaking';
import { isFilmShape, type FilmShape } from '$lib/brand/film/filmFrame';
import { storyboardFilmOf, type StoryboardFilm } from '$lib/brand/film/storyboardFilm';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { ContentPiece } from '$lib/brand/content/contentPiece';

/** The words of the film being made under the token, in the shape the runner measured, or null when no film is. */
export type FilmingPage = { film: StoryboardFilm; shape: FilmShape };

const noClips = new Map();
const pictureSeconds = 1;

/** A picture piece's shots, a second each, so the page draws picture n's words at the film's second n. */
function oneSecondAShot(piece: ContentPiece): ContentPiece {
	return { ...piece, storyboard: piece.storyboard.map((shot) => ({ ...shot, seconds: pictureSeconds })) };
}

/** The film's words only: its clips and music are laid in by the runner, so the page reaches no file. */
export async function readFilmingPage(token: string, givenShape: string | null): Promise<FilmingPage | null> {
	const shape = givenShape ?? '';
	if (!isFilmShape(shape)) return null;
	const supabase = supabaseServiceClient();
	const making = await findFilmingByToken(supabase, token);
	if (making === null) return null;
	const found = await findContentPiece(supabase, making.organisationId, making.contentPieceId);
	if (found === null) return null;
	const piece = making.kind === FilmMakingKinds.pictures ? oneSecondAShot(found.piece) : found.piece;
	return { film: storyboardFilmOf(piece, noClips), shape };
}
