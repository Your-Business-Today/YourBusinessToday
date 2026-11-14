import type { ContentPiece } from '$lib/brand/content/contentPiece';
import type { FilmMakingRecord } from './filmMakingRecord';
import type { FilmOrder } from '$lib/brand/film/filmOrder';
import type { ViewableLibraryItem } from '$lib/server/brandLibrary/signLibraryViewLinks';
import type { SupabaseClient } from '@supabase/supabase-js';

/** What the runner is told: what to make, or why there is nothing to make. */
export type RunnerOpening = { order: FilmOrder } | { problem: string };

/** What an order is made from: the request, its piece, the files it names by their links, and the page that draws its words. */
export type OrderParts = { making: FilmMakingRecord; piece: ContentPiece; items: ViewableLibraryItem[]; filmPagePath: string };

/** An order made ready, with the library item the request names as what it makes, or why it cannot be. */
export type PreparedOrder = { order: FilmOrder; libraryItemId: string } | { problem: string };

export type OrderPreparer = (supabase: SupabaseClient, parts: OrderParts) => Promise<PreparedOrder>;

/** Who the made files are added under: the person who asked, on the piece's brand. */
export function adderOf(making: FilmMakingRecord): { organisationId: string; accountId: string } {
	return { organisationId: making.organisationId, accountId: making.askedBy as string };
}

/** The piece's library items by id. */
export function itemsByIdOf(items: ViewableLibraryItem[]): Map<string, ViewableLibraryItem> {
	return new Map(items.map((item) => [item.id, item]));
}
