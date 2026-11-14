import { checkFilmOutcome } from '$lib/brand/film/checkFilmOutcome';
import { failFilmMaking, finishFilming } from './moveFilmMaking';
import { findLatestFilmMaking } from './findFilmMakings';
import { FilmMakingKinds, FilmMakingStates, type FilmMakingState } from '$lib/brand/film/filmMaking';
import { libraryUploadRecordings, recordLibraryUpload } from '$lib/server/brandLibrary/recordLibraryUpload';
import type { FilmMakingRecord } from './filmMakingRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Who says the piece's request is done: the person who asked, on the piece's brand. */
export type FilmCloser = {
	organisationId: string;
	accountId: string;
	contentPieceId: string;
};

/** Where the request ended, with it, or why the word was not taken. */
export type FilmClosing = { state: FilmMakingState; making: FilmMakingRecord } | { problem: string };

const notArrived = 'what was made did not all arrive in the library';
const keptRecordings: string[] = [libraryUploadRecordings.recorded, libraryUploadRecordings.alreadyRecorded];

/** Takes the asker's Claude's word that the piece's request is done: kept when its video or every picture arrived, failed with why when not. */
export async function closeFilmMaking(supabase: SupabaseClient, closer: FilmCloser, given: unknown): Promise<FilmClosing> {
	const outcome = checkFilmOutcome(given);
	if ('problem' in outcome) return outcome;
	const making = await findLatestFilmMaking(supabase, closer.organisationId, closer.contentPieceId);
	if (making === null) return { problem: 'nothing was asked to be made for that piece' };
	if (making.state !== FilmMakingStates.filming) return { problem: `its latest request is ${making.state}, not being made` };
	const isAsker = making.askedBy === closer.accountId;
	if (!isAsker) return { problem: 'only the person who asked for it can say it is done' };
	if (!outcome.hasArrived) return closedAs(making, FilmMakingStates.failed, outcome.failureReason);
	const isKept = await isEverythingKept(supabase, making);
	if (!isKept) return closedAs(making, FilmMakingStates.failed, notArrived);
	return closedAs(making, FilmMakingStates.ready, null);
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

async function closedAs(making: FilmMakingRecord, state: FilmMakingState, failureReason: string | null): Promise<FilmClosing> {
	const finishedAt = new Date().toISOString();
	if (failureReason === null) await finishFilming(making.id);
	if (failureReason !== null) await failFilmMaking(making.id, failureReason);
	return { state, making: { ...making, state, failureReason, finishedAt } };
}
