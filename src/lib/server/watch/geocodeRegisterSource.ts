import type { SupabaseClient } from '@supabase/supabase-js';
import { geocodeRegisterPostcodesUntil } from '$lib/server/register/geocodeRegisterPostcodes';
import type { WatchOutcome } from './watchRunLog';
import type { WatchProgress, WatchSource, WatchStart } from './watchSource';

export const geocodeRegisterSourceName = 'geocode_register';

const timeBudgetMilliseconds = 240_000;

/** Geocodes register postcodes page by page through the cache until none remain or the four minutes are up. */
export const geocodeRegisterSource: WatchSource = {
	name: geocodeRegisterSourceName,
	summary: 'geocodes the register postcodes no territory has located yet, a page at a time',
	run: geocodeWithinBudget
};

async function geocodeWithinBudget(supabase: SupabaseClient, _start: WatchStart, progress: WatchProgress): Promise<WatchOutcome> {
	const stopAt = Date.now() + timeBudgetMilliseconds;
	const { geocodedCount, remainingCount } = await geocodeRegisterPostcodesUntil(supabase, stopAt, (page) => progress(String(page.remainingCount), page.geocodedCount));
	return {
		rowsWritten: geocodedCount,
		resumeMarker: String(remainingCount),
		note: remainingCount === 0 ? 'Every register postcode in the territories is located.' : `${remainingCount} postcodes still to geocode.`,
		isFinished: true
	};
}
