import type { SupabaseClient } from '@supabase/supabase-js';
import { companiesHouseNotConfigured } from '$lib/server/register/watchRegister';
import { isCompaniesHouseConfigured } from '$lib/server/companiesHouse/companiesHouseRequest';
import { lastRunOfEveryTerritory, longestUntriedFirst, runHeadOfLine, type TerritoryRun } from './territoryRuns';
import { patchCompaniesSource } from './patchCompaniesSource';
import type { WatchOutcome } from './watchRunLog';
import type { WatchSource } from './watchSource';

export const fillTerritoriesSourceName = 'fill_territories';

/** Pulls the companies of the territories nobody has filled, one territory a run, each carrying on where its own pull stopped. */
export const fillTerritoriesSource: WatchSource = {
	name: fillTerritoriesSourceName,
	summary: 'pulls from Companies House the companies of every territory whose companies were never pulled',
	run: (supabase) => fillNextTerritory(supabase)
};

async function fillNextTerritory(supabase: SupabaseClient): Promise<WatchOutcome> {
	if (!isCompaniesHouseConfigured()) return { rowsWritten: 0, resumeMarker: '', note: companiesHouseNotConfigured, isFinished: true };
	const pulls = await lastRunOfEveryTerritory(supabase, patchCompaniesSource);
	const unfilled = longestUntriedFirst(pulls.filter(isNeverFilled));
	return runHeadOfLine(supabase, { waiting: unfilled, watcherFor: patchCompaniesSource, noneLeftNote: 'Every territory holds its companies.' });
}

/** Whether the territory's pull never finished: never tried, or cut off part way. */
function isNeverFilled(pull: TerritoryRun): boolean {
	const { lastRun } = pull;
	return lastRun === null || lastRun.finishedAt === null;
}
