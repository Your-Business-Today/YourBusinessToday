import { filmPostingOf } from '$lib/brand/film/filmPosting';
import { grantLibraryUpload, type GrantedLibraryUpload } from '$lib/server/brandLibrary/grantLibraryUpload';
import { isoDateOf } from '$lib/data/demo/demoDates';
import type { ContentPiece } from '$lib/brand/content/contentPiece';
import type { LibraryItem } from '$lib/brand/library/libraryItem';
import type { SupabaseClient } from '@supabase/supabase-js';

const filmType = 'video/mp4';
const filmExtension = '.mp4';

/** Who the video is added under: the person who asked for it, on the piece's brand. */
export type FilmAdder = { organisationId: string; accountId: string };

/** Keeps the piece's video in the library as waiting for its file, named for the piece and posted on its clips' footing. */
export async function grantFilmUpload(
	supabase: SupabaseClient,
	adder: FilmAdder,
	piece: ContentPiece,
	clips: LibraryItem[]
): Promise<GrantedLibraryUpload | { problem: string }> {
	const posting = filmPostingOf(clips);
	if ('problem' in posting) return posting;
	const today = isoDateOf(new Date());
	const item = {
		filename: `${piece.title}${filmExtension}`,
		mimeType: filmType,
		byteCount: 0,
		shows: `The video of “${piece.title}”, made from its storyboard.`,
		takenOn: today,
		...posting
	};
	return grantLibraryUpload(supabase, adder, item);
}
