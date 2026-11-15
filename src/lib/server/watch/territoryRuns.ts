import type { SupabaseClient } from '@supabase/supabase-js';
import { listPatches } from '$lib/server/patches/listPatches';
import { readLatestRun, type WatchOutcome } from './watchRunLog';
import { runWatchSource } from './runWatchSource';
import type { Patch } from '$lib/server/patches/patchRecord';
import type { WatchRun } from './watchRunRecord';
import type { WatchSource } from './watchSource';

/** The watcher each territory has of its own for one job, logged under the territory's own name. */
export type TerritoryWatcher = (territory: Patch) => WatchSource;

/** A territory with the last run of its own watcher, or none when it has never run. */
export type TerritoryRun = { territory: Patch; lastRun: WatchRun | null };

/** The territories a nightly round still has to do, in the order to do them, and what it says when none is left. */
export type TerritoryLine = { waiting: Patch[]; watcherFor: TerritoryWatcher; noneLeftNote: string };

const neverTried = '';
const oneTerritory = 1;

/** Every territory with the last run of the watcher it has for that job. */
export async function lastRunOfEveryTerritory(supabase: SupabaseClient, watcherFor: TerritoryWatcher): Promise<TerritoryRun[]> {
	const territories = await listPatches(supabase);
	return Promise.all(territories.map((territory) => lastRunOf(supabase, territory, watcherFor)));
}

async function lastRunOf(supabase: SupabaseClient, territory: Patch, watcherFor: TerritoryWatcher): Promise<TerritoryRun> {
	const { name } = watcherFor(territory);
	return { territory, lastRun: await readLatestRun(supabase, name) };
}

/** The territories with the one tried longest ago first and one never tried before any, so a run that keeps failing never holds up the rest. */
export function longestUntriedFirst(runs: TerritoryRun[]): Patch[] {
	return [...runs].sort((first, second) => lastTriedAt(first).localeCompare(lastTriedAt(second))).map(({ territory }) => territory);
}

function lastTriedAt(run: TerritoryRun): string {
	const { lastRun } = run;
	return lastRun === null ? neverTried : lastRun.startedAt;
}

/** Runs the watcher of the territory at the head of the line: one territory a run, and the round is finished once the last one in the line is. */
export async function runHeadOfLine(supabase: SupabaseClient, line: TerritoryLine): Promise<WatchOutcome> {
	const { waiting, watcherFor, noneLeftNote } = line;
	const [territory] = waiting;
	if (territory === undefined) return { rowsWritten: 0, resumeMarker: '', note: noneLeftNote, isFinished: true };
	const run = await runWatchSource(supabase, watcherFor(territory));
	const isLastInLine = run.isFinished && waiting.length === oneTerritory;
	return { rowsWritten: run.rowsWritten, resumeMarker: territory.id, note: `${territory.name}: ${run.note}`, isFinished: isLastInLine };
}
