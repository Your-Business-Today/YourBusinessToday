import { contentPiecePageOf, type ContentPiecePage } from '$lib/brand/projections/contentPiecePage';
import { readFilmFiles } from '$lib/server/brandLibrary/readFilmFiles';
import { storyboardFilmOf, type StoryboardFilm } from '$lib/brand/film/storyboardFilm';
import { findContentPiece } from './findContentPiece';
import { findContentPost } from './findContentPost';
import { findItemStandings } from '$lib/server/brandLibrary/findItemStandings';
import { isUuid } from '$lib/data/isUuid';
import { libraryIdsOf } from '$lib/brand/content/checkDraftItems';
import type { SupabaseClient } from '@supabase/supabase-js';

/** One of the organisation's pieces as its page shows it, with every channel of its post, the files it names and its storyboard as a film, or null when the brand holds no piece of that id. */
export async function readContentPiecePage(
	supabase: SupabaseClient,
	organisationId: string,
	contentPieceId: string
): Promise<(ContentPiecePage & { film: StoryboardFilm }) | null> {
	if (!isUuid(contentPieceId)) return null;
	const found = await findContentPiece(supabase, organisationId, contentPieceId);
	if (found === null) return null;
	const { piece, reviews } = found;
	const post = await findContentPost(supabase, organisationId, piece);
	const itemIds = libraryIdsOf(piece);
	const library = await findItemStandings(supabase, organisationId, itemIds);
	const files = await readFilmFiles(supabase, organisationId, itemIds);
	return { ...contentPiecePageOf(piece, reviews, post, library), film: storyboardFilmOf(piece, files) };
}
