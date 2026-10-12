import type { SupabaseClient } from '@supabase/supabase-js';
import { companiesCheckedPerRun } from '$lib/data/filingRules';
import { companiesHouseNotConfigured } from './watchRegister';
import { isCompaniesHouseConfigured } from '$lib/server/companiesHouse/companiesHouseRequest';
import { readCompaniesToCheck } from './filingsWriter';
import { sweepCompanyFilings } from './sweepCompanyFilings';
import type { WatchOutcome } from '$lib/server/watch/watchRunLog';
import type { WatchProgress, WatchStart } from '$lib/server/watch/watchSource';

const timeBudgetMilliseconds = 240_000;

/** The register companies longest unchecked, a page per run; the order itself resumes a run that was cut off. */
export async function sweepFilings(supabase: SupabaseClient, start: WatchStart, progress: WatchProgress): Promise<WatchOutcome> {
	if (!isCompaniesHouseConfigured()) return { rowsWritten: 0, resumeMarker: start.resumeMarker, note: companiesHouseNotConfigured, isFinished: true };
	const companies = await readCompaniesToCheck(supabase, companiesCheckedPerRun);
	const stopAt = Date.now() + timeBudgetMilliseconds;
	let rowsWritten = 0;
	let checked = 0;
	let marker = start.resumeMarker;
	for (const company of companies) {
		const isOutOfTime = Date.now() > stopAt;
		if (isOutOfTime) return { rowsWritten, resumeMarker: marker, note: `Out of time after ${checked} companies.`, isFinished: false };
		rowsWritten += await sweepCompanyFilings(supabase, company);
		checked += 1;
		marker = company.companyNumber;
		await progress(marker, rowsWritten);
	}
	return { rowsWritten, resumeMarker: marker, note: `Checked ${checked} companies; ${rowsWritten} new filings told.`, isFinished: true };
}
