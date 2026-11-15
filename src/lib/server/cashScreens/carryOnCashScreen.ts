import type { SupabaseClient } from '@supabase/supabase-js';
import { companiesToScreen } from './companiesToScreen';
import { finishCashScreen, markScreenProgress } from './cashScreenWriter';
import { millisecondsUntilCallsAllowed, RateBudgetSpent, stoppingCallsAt } from '$lib/server/companiesHouse/rateBudget';
import { readSuppressedCompanies } from '$lib/server/register/registerWriter';
import { screenInTurn } from './screenInTurn';
import { screenOneCompany } from './screenOneCompany';
import type { CashScreen } from './cashScreenRecord';
import type { ScreenTurnProgress } from '$lib/data/cashScreenAnswer';

/** How one turn at a screen went: how far the screen now is, and the company it stopped after. */
export type ScreenTurnReport = ScreenTurnProgress & { lastDone: string };

/** Told as each company is finished, by whoever else keeps a record of the turn. */
export type CompanyScreened = (companyNumber: string, companiesDone: number) => Promise<void>;

const millisecondsPerSecond = 1000;

/**
 * Carries one screen on from the company it last finished until it is done, the time is up, or Companies House allows
 * no more calls inside that time, and stamps it finished when it is. It never waits for Companies House past its time.
 */
export async function carryOnCashScreen(supabase: SupabaseClient, screen: CashScreen, stopAtMilliseconds: number, onCompanyScreened?: CompanyScreened): Promise<ScreenTurnReport> {
	const [companies, suppressed] = await Promise.all([companiesToScreen(supabase, screen), readSuppressedCompanies(supabase)]);
	const companyNumbers = companies.map((company) => company.companyNumber).filter((companyNumber) => !suppressed.has(companyNumber));
	const markDone = async (companyNumber: string, companiesDone: number) => {
		await markScreenProgress(supabase, screen.id, companyNumber, companiesDone);
		await onCompanyScreened?.(companyNumber, companiesDone);
	};
	const screenOne = (companyNumber: string) => screenOneCompany(supabase, companyNumber, screen.leastCash, suppressed).then(() => true, leftForNextTurn);
	const isOutOfTime = () => Date.now() > stopAtMilliseconds;
	const turn = { companyNumbers, resumeAfter: screen.resumeAfter, companiesDone: screen.companiesDone, screenOne, markDone, isOutOfTime };
	const result = await stoppingCallsAt(stopAtMilliseconds, () => screenInTurn(turn));
	if (result.isFinished) await finishCashScreen(supabase, screen.id);
	return {
		lastDone: result.lastDone,
		screenedThisTurn: result.screenedThisRun,
		companiesDone: screen.companiesDone + result.screenedThisRun,
		companyCount: companyNumbers.length,
		isFinished: result.isFinished,
		secondsUntilMoreCalls: Math.ceil(millisecondsUntilCallsAllowed() / millisecondsPerSecond)
	};
}

/** A company Companies House allowed no more calls for inside the turn's time is not screened; any other failure is a fault. */
function leftForNextTurn(failure: unknown): boolean {
	if (!(failure instanceof RateBudgetSpent)) throw failure;
	return false;
}
