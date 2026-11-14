import { adderOf, itemsByIdOf, type OrderParts, type PreparedOrder } from './orderPreparation';
import { grantFilmUpload } from './grantFilmUpload';
import { isVideo } from '$lib/brand/library/libraryItem';
import { LibraryLimits } from '$lib/brand/library/libraryLimits';
import { OrderKinds, type FilmOrderShot } from '$lib/brand/film/filmOrder';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The video's order: the library item its MP4 goes to, and every shot of any length with its clip, then the music. */
export async function prepareVideoOrder(supabase: SupabaseClient, parts: OrderParts): Promise<PreparedOrder> {
	const { making, piece, items, filmPagePath } = parts;
	const itemsById = itemsByIdOf(items);
	const shownShots = piece.storyboard.filter((shot) => shot.seconds > 0);
	const shots: FilmOrderShot[] = [];
	for (const shot of shownShots) {
		const clip = shot.clipItemId === null ? undefined : itemsById.get(shot.clipItemId);
		if (clip === undefined) return { problem: `a clip of “${piece.title}” could not be reached in the library` };
		shots.push({ seconds: shot.seconds, clipUrl: clip.viewUrl as string, isVideo: isVideo(clip) });
	}
	const grant = await grantFilmUpload(supabase, adderOf(making), piece, items);
	if ('problem' in grant) return grant;
	const music = piece.musicItemId === null ? undefined : itemsById.get(piece.musicItemId);
	const { largestByteCount } = LibraryLimits;
	const order = { kind: OrderKinds.video, filmPagePath, uploadUrl: grant.uploadUrl, largestByteCount, shots, musicUrl: music?.viewUrl ?? null };
	return { order, libraryItemId: grant.itemId };
}
