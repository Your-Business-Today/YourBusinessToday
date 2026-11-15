import type { SupabaseClient } from '@supabase/supabase-js';
import { cashScreenColumns, parseCashScreen, type CashScreen } from './cashScreenRecord';
import { isUuid } from '$lib/data/isUuid';
import type { CashScreenNarrowing } from '$lib/data/cashScreenRules';

const screensTable = 'cash_screens';

/** Records a screen for the watcher to work through; the narrowing has already been checked at the door. */
export async function startCashScreen(supabase: SupabaseClient, patchId: string, narrowing: CashScreenNarrowing, accountId: string | null): Promise<CashScreen> {
	const row = { patch_id: patchId, sector: narrowing.sector, sic_code: narrowing.sicCode, least_cash: narrowing.leastCash, started_by_account_id: accountId };
	const { data, error } = await supabase.from(screensTable).insert(row).select(cashScreenColumns).single();
	if (error) throw error;
	return parseCashScreen(data);
}

export async function getCashScreen(supabase: SupabaseClient, screenId: string): Promise<CashScreen | null> {
	if (!isUuid(screenId)) return null;
	const { data, error } = await supabase.from(screensTable).select(cashScreenColumns).eq('id', screenId).maybeSingle();
	if (error) throw error;
	return data === null ? null : parseCashScreen(data);
}

/** The screen started longest ago that is not finished: screens are worked through one at a time, in the order they were asked for. */
export async function readOldestUnfinishedScreen(supabase: SupabaseClient): Promise<CashScreen | null> {
	const { data, error } = await supabase.from(screensTable).select(cashScreenColumns).is('finished_at', null).order('started_at').limit(1).maybeSingle();
	if (error) throw error;
	return data === null ? null : parseCashScreen(data);
}

/**
 * Committed after every company, so a run cut off part way carries on at the next one. A screen only moves forward:
 * when two turns work it at once, the one behind never takes it back to a company the other has passed.
 */
export async function markScreenProgress(supabase: SupabaseClient, screenId: string, resumeAfter: string, companiesDone: number): Promise<void> {
	const { error } = await supabase.from(screensTable).update({ resume_after: resumeAfter, companies_done: companiesDone }).eq('id', screenId).lt('resume_after', resumeAfter);
	if (error) throw error;
}

export async function finishCashScreen(supabase: SupabaseClient, screenId: string): Promise<void> {
	const { error } = await supabase.from(screensTable).update({ finished_at: new Date().toISOString() }).eq('id', screenId);
	if (error) throw error;
}
