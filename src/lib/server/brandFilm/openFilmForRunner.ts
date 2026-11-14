import { failFilmMaking, startFilming } from './moveFilmMaking';
import { filmOrderOf, type RunnerOpening } from './filmOrderOf';
import { findContentPiece } from '$lib/server/brandContent/findContentPiece';
import { findFilmMaking } from './findFilmMakings';
import { FilmMakingStates } from '$lib/brand/film/filmMaking';
import { grantFilmUpload } from './grantFilmUpload';
import { hashSecret, mintSecret } from '$lib/server/oauth/oauthTokens';
import { libraryIdsOf } from '$lib/brand/content/checkDraftItems';
import { readSignedLibraryItems } from '$lib/server/brandLibrary/readFilmFiles';
import type { FilmMakingRecord } from './filmMakingRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

const filmingTokenPrefix = 'film_';

/**
 * Hands a waiting request to the runner: grants the library item its video goes to, opens the film's page under a
 * token that holds only while it is filmed, and gives every clip by a short-lived link. A request that cannot be filmed
 * is failed with the reason, so the piece says why.
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
	const grant = await grantFilmUpload(supabase, { organisationId, accountId: askedBy }, piece, items);
	if ('problem' in grant) return grant;
	const token = mintSecret(filmingTokenPrefix);
	const isStarted = await startFilming(supabase, making.id, { tokenHash: hashSecret(token), libraryItemId: grant.itemId });
	if (!isStarted) return { problem: 'the film was already taken by another run' };
	return filmOrderOf({ piece, items, token, grant });
}
