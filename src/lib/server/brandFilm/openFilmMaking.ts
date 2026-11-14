import { failFilmMaking, startFilming } from './moveFilmMaking';
import { libraryIdsOf } from '$lib/brand/content/checkDraftItems';
import { preparePictureOrder } from './preparePictureOrder';
import { prepareVideoOrder } from './prepareVideoOrder';
import { readSignedLibraryItems } from '$lib/server/brandLibrary/readFilmFiles';
import type { ContentPiece } from '$lib/brand/content/contentPiece';
import type { FilmMakingKind } from '$lib/brand/film/filmMaking';
import type { FilmMakingRecord } from './filmMakingRecord';
import type { FilmOpening, OrderPreparer } from './orderPreparation';
import type { FilmShape } from '$lib/brand/film/filmFrame';
import type { SupabaseClient } from '@supabase/supabase-js';

const prepareFor: Record<FilmMakingKind, OrderPreparer> = { video: prepareVideoOrder, pictures: preparePictureOrder };

/**
 * Opens a request just kept for the user's Claude to make: grants the library items what it makes go to and gives every
 * file by a short-lived link. A request that cannot be opened is failed with the reason, so the piece says why.
 */
export async function openFilmMaking(supabase: SupabaseClient, making: FilmMakingRecord, piece: ContentPiece, shape: FilmShape): Promise<FilmOpening> {
	const opening = await prepareAndStart(supabase, making, piece, shape);
	if ('problem' in opening) await failFilmMaking(making.id, opening.problem);
	return opening;
}

async function prepareAndStart(supabase: SupabaseClient, making: FilmMakingRecord, piece: ContentPiece, shape: FilmShape): Promise<FilmOpening> {
	const items = await readSignedLibraryItems(supabase, making.organisationId, libraryIdsOf(piece));
	const prepared = await prepareFor[making.kind](supabase, { making, piece, items, shape });
	if ('problem' in prepared) return prepared;
	const isStarted = await startFilming(making.id, prepared.libraryItemId);
	if (!isStarted) return { problem: 'the request was already taken' };
	return { order: prepared.order };
}
