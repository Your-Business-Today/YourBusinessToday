import type { SupabaseClient } from '@supabase/supabase-js';
import { daysToSweep, isStillAwaited } from './daysToSweep';
import { matchRegisterCompanies } from '$lib/server/register/matchRegisterCompanies';
import { openAccountsBulkFile, type AccountsBulkFile } from './accountsBulkFile';
import { recordAccountsFiling } from './recordAccountsFiling';
import type { WatchOutcome } from '$lib/server/watch/watchRunLog';
import type { WatchProgress, WatchStart } from '$lib/server/watch/watchSource';

const timeBudgetMilliseconds = 240_000;

/** Each day's file since the last one read: the filings by register companies go in the feed with their figures. */
export async function sweepAccountsFiled(supabase: SupabaseClient, start: WatchStart, progress: WatchProgress): Promise<WatchOutcome> {
	const today = new Date();
	const stopAt = Date.now() + timeBudgetMilliseconds;
	let marker = start.resumeMarker;
	let rowsWritten = 0;
	const notes: string[] = [];
	for (const day of daysToSweep(start.resumeMarker, today)) {
		const isOutOfTime = Date.now() > stopAt;
		if (isOutOfTime) return { rowsWritten, resumeMarker: marker, note: `Out of time after ${marker}.`, isFinished: false };
		const file = await openAccountsBulkFile(day);
		if (file === null && isStillAwaited(day, today)) return { rowsWritten, resumeMarker: marker, note: `No file yet for ${day}; ${notes.join(' ')}`.trim(), isFinished: true };
		if (file !== null) rowsWritten += await sweepDay(supabase, file, notes);
		marker = day;
		await progress(marker, rowsWritten);
	}
	return { rowsWritten, resumeMarker: marker, note: notes.join(' ') || 'Nothing new to read.', isFinished: true };
}

async function sweepDay(supabase: SupabaseClient, file: AccountsBulkFile, notes: string[]): Promise<number> {
	const { filings } = file;
	const companies = await matchRegisterCompanies(supabase, filings.map((filing) => filing.companyNumber));
	const inPatches = filings.filter((filing) => companies.has(filing.companyNumber));
	for (const filing of inPatches) {
		const company = companies.get(filing.companyNumber);
		if (company !== undefined) await recordAccountsFiling(supabase, file, filing, company);
	}
	notes.push(`${file.publishedOn}: ${inPatches.length} of ${filings.length} filings were by register companies.`);
	return inPatches.length;
}
