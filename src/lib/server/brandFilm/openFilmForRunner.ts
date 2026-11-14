import { failFilmMaking, startFilming } from './moveFilmMaking';
import { findContentPiece } from '$lib/server/brandContent/findContentPiece';
import { findFilmMaking } from './findFilmMakings';
import { FilmMakingStates, type FilmMakingKind } from '$lib/brand/film/filmMaking';
import { hashSecret, mintSecret } from '$lib/server/oauth/oauthTokens';
import { libraryIdsOf } from '$lib/brand/content/checkDraftItems';
import { preparePictureOrder } from './preparePictureOrder';
import { prepareVideoOrder } from './prepareVideoOrder';
import { readSignedLibraryItems } from '$lib/server/brandLibrary/readFilmFiles';
import type { FilmMakingRecord } from './filmMakingRecord';
import type { OrderPreparer, RunnerOpening } from './orderPreparation';
import type { SupabaseClient } from '@supabase/supabase-js';

const filmingTokenPrefix = 'film_';
const prepareFor: Record<FilmMakingKind, OrderPreparer> = { video: prepareVideoOrder, pictures: preparePictureOrder };

/**
 * Hands a waiting request to the runner: grants the library items what it makes go to, opens the page that draws its
 * words under a token that holds only while it is made, and gives every file by a short-lived link. A request that
 * cannot be made is failed with the reason, so the piece says why.
 */
export async function openFilmForRunner(supabase: SupabaseClient, filmMakingId: string): Promise<RunnerOpening> {
	const making = await findFilmMaking(supabase, filmMakingId);
	if (making === null) return { problem: 'no film was asked for by that id' };
	if (making.state !== FilmMakingStates.waiting) return { problem: `that film is ${making.state}, not waiting` };
	const opening = await openWaitingFilm(supabase, making);
	if ('problem' in opening) await failFilmMaking(supabase, making.id, opening.problem);
	return opening;
}

async function openWaitingFilm(supabase: SupabaseClient, making: FilmMakingRecord): Promise<RunnerOpening> {
	const { organisationId, askedBy } = making;
	if (askedBy === null) return { problem: 'the person who asked for the film no longer has an account' };
	const found = await findContentPiece(supabase, organisationId, making.contentPieceId);
	if (found === null) return { problem: 'the piece is no longer in the brand’s content' };
	const { piece } = found;
	const items = await readSignedLibraryItems(supabase, organisationId, libraryIdsOf(piece));
	const token = mintSecret(filmingTokenPrefix);
	const prepared = await prepareFor[making.kind](supabase, { making, piece, items, filmPagePath: `/brand-film/${token}` });
	if ('problem' in prepared) return prepared;
	const isStarted = await startFilming(supabase, making.id, { tokenHash: hashSecret(token), libraryItemId: prepared.libraryItemId });
	if (!isStarted) return { problem: 'the film was already taken by another run' };
	return { order: prepared.order };
}
