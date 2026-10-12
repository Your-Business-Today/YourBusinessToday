import type { SupabaseClient } from '@supabase/supabase-js';
import { geocodeRegisterPostcodes } from '$lib/server/register/geocodeRegisterPostcodes';
import type { WatchOutcome } from './watchRunLog';
import type { WatchProgress, WatchSource } from './watchSource';

export const geocodeRegisterSourceName = 'geocode_register';

const timeBudgetMilliseconds = 60_000;

/** Geocodes register postcodes page by page through the cache until none remain or the minute is up. */
export const geocodeRegisterSource: WatchSource = {
	name: geocodeRegisterSourceName,
	summary: 'geocodes the register postcodes no patch has located yet, a page at a time',
	run: geocodeWithinBudget
};

async function geocodeWithinBudget(
	supabase: SupabaseClient,
	_resumeMarker: string,
	progress: WatchProgress
): Promise<WatchOutcome> {
	const stopAt = Date.now() + timeBudgetMilliseconds;
	let geocodedCount = 0;
	let remainingCount = 0;
	do {
		const page = await geocodeRegisterPostcodes(supabase);
		geocodedCount += page.geocodedCount;
		remainingCount = page.remainingCount;
		await progress(String(remainingCount), geocodedCount);
	} while (remainingCount > 0 && Date.now() < stopAt);
	return {
		rowsWritten: geocodedCount,
		resumeMarker: String(remainingCount),
		note: remainingCount === 0 ? 'Every register postcode in the patches is located.' : `${remainingCount} postcodes still to geocode.`,
		isFinished: true
	};
}
