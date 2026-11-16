import type { SupabaseClient } from '@supabase/supabase-js';
import { findNewestRelease } from '$lib/server/places/overtureReleases';
import { lastRunOfEveryTerritory, longestUntriedFirst, runHeadOfLine, type TerritoryRun } from './territoryRuns';
import { isHoldingWhole, parsePlacesStanding } from '$lib/server/places/placesStanding';
import { patchPlacesSource } from './patchPlacesSource';
import type { WatchOutcome } from './watchRunLog';
import type { WatchSource } from './watchSource';

export const tradingPlacesSourceName = 'trading_places';

/** Loads the trading places of the territories that do not hold Overture's newest release, one territory a run, each carrying on where its own load stopped. */
export const tradingPlacesSource: WatchSource = {
	name: tradingPlacesSourceName,
	summary: 'loads from Overture Maps the trading places of every territory that does not hold the newest release',
	run: (supabase) => loadNextTerritory(supabase)
};

async function loadNextTerritory(supabase: SupabaseClient): Promise<WatchOutcome> {
	const release = await findNewestRelease();
	const loads = await lastRunOfEveryTerritory(supabase, patchPlacesSource);
	const behind = longestUntriedFirst(loads.filter((load) => !isHolding(load, release)));
	return runHeadOfLine(supabase, { waiting: behind, watcherFor: patchPlacesSource, noneLeftNote: `Every territory holds release ${release}.` });
}

/** Whether the territory's last load left it holding that release whole, with its places placed by their point. */
function isHolding(load: TerritoryRun, release: string): boolean {
	const { lastRun } = load;
	if (lastRun === null) return false;
	return isHoldingWhole(parsePlacesStanding(lastRun.resumeMarker), release);
}
