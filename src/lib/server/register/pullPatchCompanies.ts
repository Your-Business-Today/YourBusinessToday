import type { SupabaseClient } from '@supabase/supabase-js';
import { companiesHouseNotConfigured } from './watchRegister';
import { daysAgo } from '$lib/data/days';
import { isCompaniesHouseConfigured } from '$lib/server/companiesHouse/companiesHouseRequest';
import { monthOf } from './watchedCompanyRow';
import { pullOutcode } from './pullOutcode';
import { upsertWatchedCompanies } from './watchedCompanyWriter';
import type { Patch } from '$lib/server/patches/patchRecord';
import type { WatchOutcome } from '$lib/server/watch/watchRunLog';
import type { WatchProgress, WatchStart } from '$lib/server/watch/watchSource';

const timeBudgetMilliseconds = 240_000;
const today = 0;
const oneSearch = 1;

/** Every active company in each of a patch's outcodes, outcode by outcode: a run cut off part way carries on at the next outcode. */
export async function pullPatchCompanies(supabase: SupabaseClient, patch: Patch, start: WatchStart, progress: WatchProgress): Promise<WatchOutcome> {
	if (!isCompaniesHouseConfigured()) return { rowsWritten: 0, resumeMarker: start.resumeMarker, note: companiesHouseNotConfigured, isFinished: true };
	const resumeAfter = start.wasLastRunFinished ? '' : start.resumeMarker;
	const outcodes = patch.outcodes.filter((outcode) => outcode > resumeAfter);
	const day = daysAgo(today);
	const stopAt = Date.now() + timeBudgetMilliseconds;
	const counts: string[] = [];
	let rowsWritten = 0;
	let lastOutcodePulled = resumeAfter;
	for (const outcode of outcodes) {
		const isOutOfTime = Date.now() > stopAt;
		if (isOutOfTime) return { rowsWritten, resumeMarker: lastOutcodePulled, note: outOfTimeNote(counts, outcode), isFinished: false };
		const { companies, sliceCount } = await pullOutcode(outcode, patch.sicCodes, day);
		await upsertWatchedCompanies(supabase, companies, monthOf(day));
		rowsWritten += companies.length;
		counts.push(`${outcode} ${companies.length} in ${sliceCount} ${sliceCount === oneSearch ? 'search' : 'searches'}`);
		lastOutcodePulled = outcode;
		await progress(outcode, rowsWritten);
	}
	return { rowsWritten, resumeMarker: '', note: `Every outcode pulled. ${countsNote(counts)}`, isFinished: true };
}

function outOfTimeNote(counts: string[], nextOutcode: string): string {
	return `Out of time before ${nextOutcode}. ${countsNote(counts)}`;
}

function countsNote(counts: string[]): string {
	return counts.length === 0 ? 'No outcode pulled this run.' : `${counts.join('; ')}.`;
}
