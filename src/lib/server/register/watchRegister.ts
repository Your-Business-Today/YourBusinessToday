import type { SupabaseClient } from '@supabase/supabase-js';
import { daysAgo } from '$lib/data/days';
import { formatWatchMarker, parseWatchMarker } from './watchMarker';
import { isCompaniesHouseConfigured } from '$lib/server/companiesHouse/companiesHouseRequest';
import { readOutcodesInUse } from './registerWriter';
import { watchOutcode } from './watchOutcode';
import type { WatchOutcome } from '$lib/server/watch/watchRunLog';
import type { WatchProgress, WatchStart } from '$lib/server/watch/watchSource';

const timeBudgetMilliseconds = 240_000;
const lookBackDays = 3;
const oneDay = 1;
const noDays = 0;

export const companiesHouseNotConfigured = 'Companies House is not configured: no key, so the register is not watched.';

/** Every patch outcode since the day the last run checked: a run cut off mid-way picks up at the next outcode for that day. */
export async function watchRegister(supabase: SupabaseClient, start: WatchStart, progress: WatchProgress): Promise<WatchOutcome> {
	if (!isCompaniesHouseConfigured()) return { rowsWritten: 0, resumeMarker: start.resumeMarker, note: companiesHouseNotConfigured, isFinished: true };
	const last = parseWatchMarker(start.resumeMarker);
	const day = start.wasLastRunFinished || last === null ? dayToCheckAfter(last?.day ?? null) : last.day;
	const resumeAfter = start.wasLastRunFinished || last === null ? '' : last.outcode;
	const outcodes = [...(await readOutcodesInUse(supabase))].sort().filter((outcode) => outcode > resumeAfter);
	const stopAt = Date.now() + timeBudgetMilliseconds;
	let rowsWritten = 0;
	let marker = { day, outcode: resumeAfter };
	for (const outcode of outcodes) {
		const isOutOfTime = Date.now() > stopAt;
		if (isOutOfTime) return { rowsWritten, resumeMarker: formatWatchMarker(marker), note: `Out of time after ${outcode}.`, isFinished: false };
		rowsWritten += await watchOutcode(supabase, outcode, [], day);
		marker = { day, outcode };
		await progress(formatWatchMarker(marker), rowsWritten);
	}
	const finishedMarker = formatWatchMarker({ day: daysAgo(noDays), outcode: '' });
	return { rowsWritten, resumeMarker: finishedMarker, note: `Checked ${outcodes.length} outcodes since ${day}.`, isFinished: true };
}

/** The last day checked again, or a few days back on the first run; never later than yesterday. */
function dayToCheckAfter(lastDay: string | null): string {
	const yesterday = daysAgo(oneDay);
	const firstRunDay = daysAgo(lookBackDays);
	if (lastDay === null) return firstRunDay;
	return lastDay < yesterday ? lastDay : yesterday;
}
