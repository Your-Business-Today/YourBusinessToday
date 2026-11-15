import type { SupabaseClient } from '@supabase/supabase-js';
import { carryOnCashScreen, type ScreenTurnReport } from './carryOnCashScreen';
import { companiesHouseNotConfigured } from '$lib/server/register/watchRegister';
import { isCompaniesHouseConfigured } from '$lib/server/companiesHouse/companiesHouseRequest';
import { readOldestUnfinishedScreen } from './cashScreenWriter';
import type { WatchOutcome } from '$lib/server/watch/watchRunLog';
import type { WatchProgress } from '$lib/server/watch/watchSource';

const timeBudgetMilliseconds = 240_000;

/**
 * Carries on the oldest unfinished screen from the company it last finished, until the screen is done or the run's time is up.
 * The run is finished only when no screen is left waiting: that is what tells the knock that keeps knocking to stop.
 */
export async function runCashScreens(supabase: SupabaseClient, progress: WatchProgress): Promise<WatchOutcome> {
	if (!isCompaniesHouseConfigured()) return { rowsWritten: 0, resumeMarker: '', note: companiesHouseNotConfigured, isFinished: true };
	const screen = await readOldestUnfinishedScreen(supabase);
	if (screen === null) return { rowsWritten: 0, resumeMarker: '', note: 'No screen waiting.', isFinished: true };
	const stopAt = Date.now() + timeBudgetMilliseconds;
	const turn = await carryOnCashScreen(supabase, screen, stopAt, (companyNumber, companiesDone) => progress(`${screen.id}:${companyNumber}`, companiesDone));
	const nextScreen = turn.isFinished ? await readOldestUnfinishedScreen(supabase) : screen;
	const note = `${turn.screenedThisTurn} companies screened for screen ${screen.id}, ${howItStopped(turn)}.`;
	return { rowsWritten: turn.screenedThisTurn, resumeMarker: `${screen.id}:${turn.lastDone}`, note, isFinished: nextScreen === null };
}

function howItStopped(turn: ScreenTurnReport): string {
	if (turn.isFinished) return 'which is finished';
	const hasCallsLeft = turn.secondsUntilMoreCalls === 0;
	return hasCallsLeft ? 'out of time' : `stopped until Companies House allows more calls in ${turn.secondsUntilMoreCalls} seconds`;
}
