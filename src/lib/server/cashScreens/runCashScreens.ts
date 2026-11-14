import type { SupabaseClient } from '@supabase/supabase-js';
import { companiesHouseNotConfigured } from '$lib/server/register/watchRegister';
import { companiesToScreen } from './companiesToScreen';
import { finishCashScreen, markScreenProgress, readOldestUnfinishedScreen } from './cashScreenWriter';
import { isCompaniesHouseConfigured } from '$lib/server/companiesHouse/companiesHouseRequest';
import { readSuppressedCompanies } from '$lib/server/register/registerWriter';
import { screenInTurn } from './screenInTurn';
import { screenOneCompany } from './screenOneCompany';
import type { WatchOutcome } from '$lib/server/watch/watchRunLog';
import type { WatchProgress } from '$lib/server/watch/watchSource';

const timeBudgetMilliseconds = 240_000;

/** Carries on the oldest unfinished screen from the company it last finished, until the screen is done or the run's time is up. */
export async function runCashScreens(supabase: SupabaseClient, progress: WatchProgress): Promise<WatchOutcome> {
	if (!isCompaniesHouseConfigured()) return { rowsWritten: 0, resumeMarker: '', note: companiesHouseNotConfigured, isFinished: true };
	const screen = await readOldestUnfinishedScreen(supabase);
	if (screen === null) return { rowsWritten: 0, resumeMarker: '', note: 'No screen waiting.', isFinished: true };
	const [companies, suppressed] = await Promise.all([companiesToScreen(supabase, screen), readSuppressedCompanies(supabase)]);
	const stopAt = Date.now() + timeBudgetMilliseconds;
	const markDone = async (companyNumber: string, companiesDone: number) => {
		await markScreenProgress(supabase, screen.id, companyNumber, companiesDone);
		await progress(`${screen.id}:${companyNumber}`, companiesDone);
	};
	const result = await screenInTurn({
		companyNumbers: companies.map((company) => company.companyNumber).filter((companyNumber) => !suppressed.has(companyNumber)),
		resumeAfter: screen.resumeAfter,
		companiesDone: screen.companiesDone,
		screenOne: (companyNumber) => screenOneCompany(supabase, companyNumber, screen.leastCash, suppressed),
		markDone,
		isOutOfTime: () => Date.now() > stopAt
	});
	if (result.isFinished) await finishCashScreen(supabase, screen.id);
	const note = `${result.screenedThisRun} companies screened for screen ${screen.id}${result.isFinished ? ', which is finished' : ', out of time'}.`;
	return { rowsWritten: result.screenedThisRun, resumeMarker: `${screen.id}:${result.lastDone}`, note, isFinished: result.isFinished };
}
