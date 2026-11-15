import type { ContentPiece, StoryboardShot } from '$lib/brand/content/contentPiece';
import type { FilmMakingRecord } from './filmMakingRecord';
import type { FilmOrder, OrderFile, ShotWords } from '$lib/brand/film/filmOrder';
import type { FilmShape } from '$lib/brand/film/filmFrame';
import type { ViewableLibraryItem } from '$lib/server/brandLibrary/signLibraryViewLinks';
import type { SupabaseClient } from '@supabase/supabase-js';

/** What the user's Claude is given: what to make, or why there is nothing to make. */
export type FilmOpening = { order: FilmOrder } | { problem: string };

/** What an order is made from: the request, its piece, the files it names by their links, and the frame's shape. */
export type OrderParts = {
	making: FilmMakingRecord;
	piece: ContentPiece;
	items: ViewableLibraryItem[];
	shape: FilmShape;
};

/** An order made ready, with the library item the request names as what it makes, or why it cannot be. */
export type PreparedOrder = { order: FilmOrder; libraryItemId: string } | { problem: string };

export type OrderPreparer = (supabase: SupabaseClient, parts: OrderParts) => Promise<PreparedOrder>;

/** Who the made files are added under: the person who asked, on the piece's brand. */
export function adderOf(making: FilmMakingRecord): {
	organisationId: string;
	accountId: string;
} {
	return { organisationId: making.organisationId, accountId: making.askedBy as string };
}

/** The piece's library items by id. */
export function itemsByIdOf(items: ViewableLibraryItem[]): Map<string, ViewableLibraryItem> {
	return new Map(items.map((item) => [item.id, item]));
}

/** A library item as the recipe fetches it. */
export function orderFileOf(item: ViewableLibraryItem): OrderFile {
	return { url: item.viewUrl as string, filename: item.filename };
}

/** A shot's words as the recipe draws them. */
export function shotWordsOf(shot: StoryboardShot): ShotWords {
	const { overline, underline, wordsAt } = shot;
	return { overline, headline: shot.onScreenText, underline, wordsAt };
}

/** The brand's look the piece was drafted under. */
export function lookOf(piece: ContentPiece): Record<string, string> {
	const { brandSnapshot } = piece;
	return brandSnapshot.variables ?? {};
}
