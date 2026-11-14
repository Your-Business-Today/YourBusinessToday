import { checkFilmOutcome } from '$lib/brand/film/checkFilmOutcome';
import { failFilmMaking, finishFilming } from './moveFilmMaking';
import { findFilmMaking } from './findFilmMakings';
import { FilmMakingStates, type FilmMakingState } from '$lib/brand/film/filmMaking';
import { libraryUploadRecordings, recordLibraryUpload } from '$lib/server/brandLibrary/recordLibraryUpload';
import type { FilmMakingRecord } from './filmMakingRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Where the request ended, or why the runner's word was not taken. */
export type RunnerClosing = { state: FilmMakingState } | { problem: string };

const notArrived = 'the video did not arrive in the library';
const keptRecordings: string[] = [libraryUploadRecordings.recorded, libraryUploadRecordings.alreadyRecorded];

/** Takes the runner's word that a film it had is done: kept in the library when its video arrived, failed with the reason when not. */
export async function closeFilmForRunner(supabase: SupabaseClient, filmMakingId: string, given: unknown): Promise<RunnerClosing> {
	const outcome = checkFilmOutcome(given);
	if ('problem' in outcome) return outcome;
	const making = await findFilmMaking(supabase, filmMakingId);
	if (making === null) return { problem: 'no film was asked for by that id' };
	if (making.state !== FilmMakingStates.filming) return { problem: `that film is ${making.state}, not filming` };
	if (!outcome.hasArrived) return failWith(supabase, making, outcome.failureReason);
	const isKept = await isVideoKept(supabase, making);
	if (!isKept) return failWith(supabase, making, notArrived);
	await finishFilming(supabase, making.id);
	return { state: FilmMakingStates.ready };
}

async function isVideoKept(supabase: SupabaseClient, making: FilmMakingRecord): Promise<boolean> {
	const { organisationId, askedBy, libraryItemId } = making;
	if (askedBy === null || libraryItemId === null) return false;
	const recording = await recordLibraryUpload(supabase, { organisationId, accountId: askedBy }, libraryItemId);
	return keptRecordings.includes(recording.status);
}

async function failWith(supabase: SupabaseClient, making: FilmMakingRecord, failureReason: string): Promise<RunnerClosing> {
	await failFilmMaking(supabase, making.id, failureReason);
	return { state: FilmMakingStates.failed };
}
