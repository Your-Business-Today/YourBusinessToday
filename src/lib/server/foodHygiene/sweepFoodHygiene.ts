import type { SupabaseClient } from '@supabase/supabase-js';
import { authoritiesToSweep } from './authoritiesToSweep';
import { listFoodAuthorities } from './listFoodAuthorities';
import { matchAuthoritiesToDistricts } from './matchAuthorities';
import { readDistrictsOfOutcodes } from '$lib/server/postcodes/districtsOfOutcodes';
import { readOutcodesInUse } from '$lib/server/register/registerWriter';
import { readSweptAuthorities } from '$lib/server/premises/readSweptAuthorities';
import { sweepAuthority } from './sweepAuthority';
import type { FoodAuthority } from './foodAuthorityRecord';
import type { WatchOutcome } from '$lib/server/watch/watchRunLog';
import type { WatchProgress, WatchStart } from '$lib/server/watch/watchSource';

const timeBudgetMilliseconds = 240_000;

/** Every authority a patch's outcodes fall in, read when its file moved; a run out of time says where it stopped. */
export async function sweepFoodHygiene(supabase: SupabaseClient, start: WatchStart, progress: WatchProgress): Promise<WatchOutcome> {
	const outcodes = await readOutcodesInUse(supabase);
	if (outcodes.size === 0) return { rowsWritten: 0, resumeMarker: '', note: 'No patch covers an outcode yet.', isFinished: true };
	const districts = await readDistrictsOfOutcodes([...outcodes]);
	const { matched, unmatched } = matchAuthoritiesToDistricts(await listFoodAuthorities(), [...districts.values()].flat());
	const queue = authoritiesToSweep(matched, await readSweptAuthorities(supabase), start);
	const stopAt = Date.now() + timeBudgetMilliseconds;
	const tally = { written: 0, gone: 0, refused: 0, swept: 0 };
	let marker = start.wasLastRunFinished ? '' : start.resumeMarker;
	for (const authority of queue) {
		const isOutOfTime = Date.now() > stopAt;
		if (isOutOfTime) return outOfTime(marker, tally, queue.length);
		await sweepOne(supabase, authority, outcodes, tally);
		marker = authority.code;
		await progress(marker, tally.written);
	}
	return { rowsWritten: tally.written, resumeMarker: marker, note: finishedNote(tally, queue, unmatched), isFinished: true };
}

type SweepTally = { written: number; gone: number; refused: number; swept: number };

async function sweepOne(supabase: SupabaseClient, authority: FoodAuthority, outcodes: Set<string>, tally: SweepTally): Promise<void> {
	const sweep = await sweepAuthority(supabase, authority, outcodes);
	tally.written += sweep.written;
	tally.gone += sweep.gone;
	tally.refused += sweep.refused;
	tally.swept += 1;
}

function outOfTime(marker: string, tally: SweepTally, queued: number): WatchOutcome {
	const waiting = queued - tally.swept;
	return { rowsWritten: tally.written, resumeMarker: marker, note: `Out of time after ${marker}; ${waiting} authorities wait for the next run.`, isFinished: false };
}

function finishedNote(tally: SweepTally, queue: FoodAuthority[], unmatched: string[]): string {
	const names = queue.map((authority) => authority.name).join(', ');
	const swept = queue.length === 0 ? 'No authority file moved since the last sweep.' : `Swept ${names}: ${tally.gone} gone, ${tally.refused} rows refused.`;
	const districts = unmatched.length === 0 ? '' : ` No authority matched ${unmatched.join(', ')}.`;
	return `${swept}${districts}`;
}
