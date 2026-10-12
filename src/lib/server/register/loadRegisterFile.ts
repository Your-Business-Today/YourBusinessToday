import type { SupabaseClient } from '@supabase/supabase-js';
import { csvRecordsInZip } from '$lib/server/csv/csvRecordsInZip';
import { loadRegisterRecords, type RegisterLoadSummary } from './registerFileLoader';
import {
	markCompaniesGone,
	readOutcodesInUse,
	readSuppressedCompanies,
	recordRegisterLoads,
	recordRegisterRun,
	upsertRegisterCompanies
} from './registerWriter';

const monthInFileName = /(\d{4}-\d{2}-01)/;

/** The month a Companies House monthly file is as at, read from its name: BasicCompanyDataAsOneFile-2026-10-01.zip. */
export function seenMonthOf(zipPath: string): string | null {
	return monthInFileName.exec(zipPath)?.[1] ?? null;
}

/** Loads one monthly file for every patch outcode: upserts, marks the missing gone, and logs the run. */
export async function loadRegisterFile(
	supabase: SupabaseClient,
	zipPath: string,
	seenMonth: string
): Promise<RegisterLoadSummary> {
	const startedAt = new Date().toISOString();
	const [outcodes, suppressed] = await Promise.all([readOutcodesInUse(supabase), readSuppressedCompanies(supabase)]);
	const summary = await loadRegisterRecords(
		csvRecordsInZip(zipPath),
		{ outcodes, suppressed, seenMonth },
		{ upsertCompanies: (companies) => upsertRegisterCompanies(supabase, companies) }
	);
	await markCompaniesGone(supabase, [...outcodes], seenMonth);
	await recordRegisterLoads(supabase, summary.countByOutcode, seenMonth);
	await recordRegisterRun(supabase, summary, seenMonth, startedAt);
	return summary;
}
