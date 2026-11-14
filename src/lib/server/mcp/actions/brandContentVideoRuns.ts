import { askForFilm } from '$lib/server/brandFilm/askForFilm';
import { describeFilmAsking } from './describeFilmMaking';
import { readText } from '../actionTypes';
import { validateRecordId } from '$lib/data/isUuid';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** Asks for the video piece to be made into its MP4, under the person asking. */
export async function makeContentVideo(caller: McpCaller, input: Record<string, unknown>, organisation: Organisation): Promise<string> {
	const contentPieceId = readText(input, 'contentPieceId');
	const idRefusal = validateRecordId('contentPieceId', contentPieceId);
	if (idRefusal !== null) return idRefusal;
	const asker = { organisationId: organisation.id, accountId: caller.accountId, contentPieceId };
	return describeFilmAsking(await askForFilm(caller.supabase, asker));
}
