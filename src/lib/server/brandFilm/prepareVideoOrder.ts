import { adderOf, itemsByIdOf, lookOf, orderFileOf, shotWordsOf, type OrderParts, type PreparedOrder } from './orderPreparation';
import { grantFilmUpload } from './grantFilmUpload';
import { isVideo } from '$lib/brand/library/libraryItem';
import { LibraryLimits } from '$lib/brand/library/libraryLimits';
import { OrderKinds, type FilmOrderShot, type VideoOrder } from '$lib/brand/film/filmOrder';
import type { ContentPiece } from '$lib/brand/content/contentPiece';
import type { ViewableLibraryItem } from '$lib/server/brandLibrary/signLibraryViewLinks';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Every shot of any length with its clip and words, or why one cannot be laid in. */
function shownShotsOf(piece: ContentPiece, itemsById: Map<string, ViewableLibraryItem>): FilmOrderShot[] | { problem: string } {
	const shots: FilmOrderShot[] = [];
	for (const shot of piece.storyboard.filter((candidate) => candidate.seconds > 0)) {
		const clip = shot.clipItemId === null ? undefined : itemsById.get(shot.clipItemId);
		if (clip === undefined) return { problem: `a clip of “${piece.title}” could not be reached in the library` };
		shots.push({ seconds: shot.seconds, clip: orderFileOf(clip), isVideo: isVideo(clip), words: shotWordsOf(shot) });
	}
	if (shots.length === 0) return { problem: `“${piece.title}” has no shot of any length` };
	return shots;
}

/** The video's order: the library item its MP4 goes to, and every shot of any length with its clip and words, then the music. */
export async function prepareVideoOrder(supabase: SupabaseClient, parts: OrderParts): Promise<PreparedOrder> {
	const { making, piece, items, shape } = parts;
	const itemsById = itemsByIdOf(items);
	const shots = shownShotsOf(piece, itemsById);
	if ('problem' in shots) return shots;
	const grant = await grantFilmUpload(supabase, adderOf(making), piece, items);
	if ('problem' in grant) return grant;
	const music = piece.musicItemId === null ? undefined : itemsById.get(piece.musicItemId);
	const { largestByteCount } = LibraryLimits;
	const order: VideoOrder = { kind: OrderKinds.video, shape, look: lookOf(piece), uploadUrl: grant.uploadUrl, largestByteCount, shots, music: null };
	if (music !== undefined) order.music = orderFileOf(music);
	return { order, libraryItemId: grant.itemId };
}
