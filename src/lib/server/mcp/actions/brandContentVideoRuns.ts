import { askForFilm } from '$lib/server/brandFilm/askForFilm';
import { describeFilmAsking } from './describeFilmMaking';
import { FilmMakingKinds, type FilmMakingKind } from '$lib/brand/film/filmMaking';
import { readText } from '../actionTypes';
import { validateRecordId } from '$lib/data/isUuid';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

type Input = Record<string, unknown>;

async function askToMake(caller: McpCaller, input: Input, organisation: Organisation, kind: FilmMakingKind): Promise<string> {
	const contentPieceId = readText(input, 'contentPieceId');
	const idRefusal = validateRecordId('contentPieceId', contentPieceId);
	if (idRefusal !== null) return idRefusal;
	const asker = { organisationId: organisation.id, accountId: caller.accountId, contentPieceId, kind };
	return describeFilmAsking(await askForFilm(caller.supabase, asker), kind);
}

/** Asks for the video piece to be made into its MP4, under the person asking. */
export function makeContentVideo(caller: McpCaller, input: Input, organisation: Organisation): Promise<string> {
	return askToMake(caller, input, organisation, FilmMakingKinds.video);
}

/** Asks for the picture piece to be made into one PNG a shot, under the person asking. */
export function makeContentPictures(caller: McpCaller, input: Input, organisation: Organisation): Promise<string> {
	return askToMake(caller, input, organisation, FilmMakingKinds.pictures);
}
