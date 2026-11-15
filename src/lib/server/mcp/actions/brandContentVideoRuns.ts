import { askForFilm } from '$lib/server/brandFilm/askForFilm';
import { closeFilmMaking } from '$lib/server/brandFilm/closeFilmMaking';
import { describeFilmAsking, describeFilmClosing } from './describeFilmMaking';
import { isFilmShape } from '$lib/brand/film/filmFrame';
import { FilmMakingKinds, type FilmMakingKind } from '$lib/brand/film/filmMaking';
import { readOptionalText, readText } from '../actionTypes';
import { validateRecordId } from '$lib/data/isUuid';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

type Input = Record<string, unknown>;

const shapeRefusal = 'shape is wide, square or tall. Nothing was asked for.';

async function askToMake(caller: McpCaller, input: Input, organisation: Organisation, kind: FilmMakingKind): Promise<string> {
	const contentPieceId = readText(input, 'contentPieceId');
	const idRefusal = validateRecordId('contentPieceId', contentPieceId);
	if (idRefusal !== null) return idRefusal;
	const shapeGiven = readOptionalText(input, 'shape');
	const isShapeKnown = shapeGiven === null || isFilmShape(shapeGiven);
	if (!isShapeKnown) return shapeRefusal;
	const asker = { organisationId: organisation.id, accountId: caller.accountId, contentPieceId, kind };
	return describeFilmAsking(await askForFilm(caller.supabase, asker, shapeGiven), kind);
}

/** Asks for the video piece to be made into its MP4 by the caller's own Claude, under the person asking. */
export function makeContentVideo(caller: McpCaller, input: Input, organisation: Organisation): Promise<string> {
	return askToMake(caller, input, organisation, FilmMakingKinds.video);
}

/** Asks for the picture piece to be made into one PNG a shot by the caller's own Claude, under the person asking. */
export function makeContentPictures(caller: McpCaller, input: Input, organisation: Organisation): Promise<string> {
	return askToMake(caller, input, organisation, FilmMakingKinds.pictures);
}

/** Takes the caller's Claude's word that it ran the recipe: everything sent, or why not. */
export async function recordContentMade(caller: McpCaller, input: Input, organisation: Organisation): Promise<string> {
	const contentPieceId = readText(input, 'contentPieceId');
	const idRefusal = validateRecordId('contentPieceId', contentPieceId);
	if (idRefusal !== null) return idRefusal;
	const closer = { organisationId: organisation.id, accountId: caller.accountId, contentPieceId };
	const outcome = { hasArrived: input.hasArrived, failureReason: input.failureReason };
	return describeFilmClosing(await closeFilmMaking(caller.supabase, closer, outcome));
}
