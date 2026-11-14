import { findContentPiece } from '$lib/server/brandContent/findContentPiece';
import { findFilmingByToken } from './findFilmMakings';
import { isFilmShape, type FilmShape } from '$lib/brand/film/filmFrame';
import { storyboardFilmOf, type StoryboardFilm } from '$lib/brand/film/storyboardFilm';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';

/** The words of the film being made under the token, in the shape the runner measured, or null when no film is. */
export type FilmingPage = { film: StoryboardFilm; shape: FilmShape };

const noClips = new Map();

/** The film's words only: its clips and music are laid in by the runner, so the page reaches no file. */
export async function readFilmingPage(token: string, givenShape: string | null): Promise<FilmingPage | null> {
	const shape = givenShape ?? '';
	if (!isFilmShape(shape)) return null;
	const supabase = supabaseServiceClient();
	const making = await findFilmingByToken(supabase, token);
	if (making === null) return null;
	const found = await findContentPiece(supabase, making.organisationId, making.contentPieceId);
	if (found === null) return null;
	return { film: storyboardFilmOf(found.piece, noClips), shape };
}
