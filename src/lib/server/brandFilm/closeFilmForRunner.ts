import { checkFilmOutcome } from '$lib/brand/film/checkFilmOutcome';
import { failFilmMaking, finishFilming } from './moveFilmMaking';
import { findFilmMaking } from './findFilmMakings';
import { FilmMakingKinds, FilmMakingStates, type FilmMakingState } from '$lib/brand/film/filmMaking';
import { libraryUploadRecordings, recordLibraryUpload } from '$lib/server/brandLibrary/recordLibraryUpload';
import type { FilmMakingRecord } from './filmMakingRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Where the request ended, or why the runner's word was not taken. */
export type RunnerClosing = { state: FilmMakingState } | { problem: string };

const notArrived = 'what was made did not all arrive in the library';
const keptRecordings: string[] = [libraryUploadRecordings.recorded, libraryUploadRecordings.alreadyRecorded];

/** Takes the runner's word that a film it had is done: kept when its video or every picture arrived, failed with the reason when not. */
export async function closeFilmForRunner(supabase: SupabaseClient, filmMakingId: string, given: unknown): Promise<RunnerClosing> {
	const outcome = checkFilmOutcome(given);
	if ('problem' in outcome) return outcome;
	const making = await findFilmMaking(supabase, filmMakingId);
	if (making === null) return { problem: 'no film was asked for by that id' };
	if (making.state !== FilmMakingStates.filming) return { problem: `that film is ${making.state}, not filming` };
	if (!outcome.hasArrived) return failWith(supabase, making, outcome.failureReason);
	const isKept = await isEverythingKept(supabase, making);
	if (!isKept) return failWith(supabase, making, notArrived);
	await finishFilming(supabase, making.id);
	return { state: FilmMakingStates.ready };
}

/** Whether the video, or every picture, arrived and is now kept in the library. */
async function isEverythingKept(supabase: SupabaseClient, making: FilmMakingRecord): Promise<boolean> {
	const { organisationId, askedBy, libraryItemId, pictureItemIds } = making;
	const isPictures = making.kind === FilmMakingKinds.pictures;
	const itemIds = isPictures ? pictureItemIds : [libraryItemId];
	if (askedBy === null || itemIds.length === 0) return false;
	const adder = { organisationId, accountId: askedBy };
	for (const itemId of itemIds) {
		if (itemId === null) return false;
		const recording = await recordLibraryUpload(supabase, adder, itemId);
		const isKept = keptRecordings.includes(recording.status);
		if (!isKept) return false;
	}
	return true;
}

async function failWith(supabase: SupabaseClient, making: FilmMakingRecord, failureReason: string): Promise<RunnerClosing> {
	await failFilmMaking(supabase, making.id, failureReason);
	return { state: FilmMakingStates.failed };
}
