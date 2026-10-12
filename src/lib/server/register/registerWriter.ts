import type { SupabaseClient } from '@supabase/supabase-js';
import type { RegisterCompanySeed } from './registerFileRow';
import type { RegisterLoadSummary } from './registerFileLoader';

export const registerFileSource = 'register_file';

/** Every outcode any patch covers: the rows of the file worth keeping. */
export async function readOutcodesInUse(supabase: SupabaseClient): Promise<Set<string>> {
	const { data, error } = await supabase.from('patch_outcodes').select('outcode');
	if (error) throw error;
	return new Set(data.map((row: Record<string, unknown>) => row.outcode as string));
}

export async function readSuppressedCompanies(supabase: SupabaseClient): Promise<Set<string>> {
	const { data, error } = await supabase.from('suppressed_companies').select('company_number');
	if (error) throw error;
	return new Set(data.map((row: Record<string, unknown>) => row.company_number as string));
}

export async function upsertRegisterCompanies(supabase: SupabaseClient, companies: RegisterCompanySeed[]): Promise<void> {
	const { error } = await supabase.rpc('upsert_register_companies', { rows: companies });
	if (error) throw error;
}

/** A company the month's file no longer carries, in an outcode the file was read for, has gone. */
export async function markCompaniesGone(supabase: SupabaseClient, outcodes: string[], seenMonth: string): Promise<void> {
	if (outcodes.length === 0) return;
	const { error } = await supabase
		.from('register_companies')
		.update({ is_gone: true })
		.in('outcode', outcodes)
		.lt('last_seen_month', seenMonth)
		.eq('is_gone', false);
	if (error) throw error;
}

export async function recordRegisterLoads(
	supabase: SupabaseClient,
	countByOutcode: Map<string, number>,
	seenMonth: string
): Promise<void> {
	const rows = [...countByOutcode.entries()].map(([outcode, count]) => ({
		outcode,
		loaded_month: seenMonth,
		company_count: count
	}));
	if (rows.length === 0) return;
	const { error } = await supabase.from('register_loads').upsert(rows, { onConflict: 'outcode,loaded_month' });
	if (error) throw error;
}

export async function recordRegisterRun(
	supabase: SupabaseClient,
	summary: RegisterLoadSummary,
	seenMonth: string,
	startedAt: string
): Promise<void> {
	const { error } = await supabase.from('watch_runs').insert({
		source: registerFileSource,
		started_at: startedAt,
		finished_at: new Date().toISOString(),
		rows_written: summary.companiesWritten,
		resume_marker: seenMonth,
		note: `${summary.malformedRows} malformed rows skipped, ${summary.suppressedRows} suppressed`
	});
	if (error) throw error;
}
