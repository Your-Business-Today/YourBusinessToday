import type { SupabaseClient } from '@supabase/supabase-js';
import { companiesHouseNotConfigured } from '$lib/server/register/watchRegister';
import { isCompaniesHouseConfigured } from '$lib/server/companiesHouse/companiesHouseRequest';
import { listPatches } from '$lib/server/patches/listPatches';
import { patchCompaniesSource } from './patchCompaniesSource';
import { readLatestRun, type WatchOutcome } from './watchRunLog';
import { runWatchSource } from './runWatchSource';
import type { Patch } from '$lib/server/patches/patchRecord';
import type { WatchRun } from './watchRunRecord';
import type { WatchSource } from './watchSource';

export const fillTerritoriesSourceName = 'fill_territories';

type TerritoryPull = { territory: Patch; lastPull: WatchRun | null };

const neverTried = '';
const oneTerritory = 1;

/** Pulls the companies of the territories nobody has filled, one territory a run, each carrying on where its own pull stopped. */
export const fillTerritoriesSource: WatchSource = {
	name: fillTerritoriesSourceName,
	summary: 'pulls from Companies House the companies of every territory whose companies were never pulled',
	run: (supabase) => fillNextTerritory(supabase)
};

async function fillNextTerritory(supabase: SupabaseClient): Promise<WatchOutcome> {
	if (!isCompaniesHouseConfigured()) return { rowsWritten: 0, resumeMarker: '', note: companiesHouseNotConfigured, isFinished: true };
	const unfilled = territoriesNeverFilled(await pullOfEveryTerritory(supabase));
	const [territory] = unfilled;
	if (territory === undefined) return { rowsWritten: 0, resumeMarker: '', note: 'Every territory holds its companies.', isFinished: true };
	const pull = await runWatchSource(supabase, patchCompaniesSource(territory));
	const isLastToFill = pull.isFinished && unfilled.length === oneTerritory;
	return { rowsWritten: pull.rowsWritten, resumeMarker: territory.id, note: `${territory.name}: ${pull.note}`, isFinished: isLastToFill };
}

async function pullOfEveryTerritory(supabase: SupabaseClient): Promise<TerritoryPull[]> {
	const territories = await listPatches(supabase);
	return Promise.all(territories.map((territory) => lastPullOf(supabase, territory)));
}

async function lastPullOf(supabase: SupabaseClient, territory: Patch): Promise<TerritoryPull> {
	const { name } = patchCompaniesSource(territory);
	return { territory, lastPull: await readLatestRun(supabase, name) };
}

/** The territories whose pull never finished, the one tried longest ago first, so a pull that keeps failing never holds up the rest. */
export function territoriesNeverFilled(pulls: TerritoryPull[]): Patch[] {
	return pulls
		.filter(({ lastPull }) => lastPull === null || lastPull.finishedAt === null)
		.sort((first, second) => lastTriedAt(first).localeCompare(lastTriedAt(second)))
		.map(({ territory }) => territory);
}

function lastTriedAt(pull: TerritoryPull): string {
	const { lastPull } = pull;
	return lastPull === null ? neverTried : lastPull.startedAt;
}
