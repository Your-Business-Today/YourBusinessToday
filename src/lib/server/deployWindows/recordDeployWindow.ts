import type { SupabaseClient } from '@supabase/supabase-js';
import { deployWindowStarts } from '$lib/data/deployWindow';
import type { Promotion } from './promoteStaging';

const deployWindowsTable = 'project_deploy_windows';

/** Keeps the day's timed window as the project's one row for that date; a window tried again after failing replaces it. */
export async function recordTimedWindow(
	supabase: SupabaseClient,
	projectId: string,
	windowDate: string,
	promotion: Promotion
): Promise<void> {
	await forgetTimedWindow(supabase, projectId, windowDate);
	const row = { project_id: projectId, window_date: windowDate, started_by: deployWindowStarts.window, ...columnsOf(promotion) };
	await insertRun(supabase, row);
}

/** Keeps a deploy by hand as a row of its own, however many the day brings, so it never stands in for the timed window. */
export async function recordManualDeploy(
	supabase: SupabaseClient,
	projectId: string,
	windowDate: string,
	promotion: Promotion
): Promise<void> {
	const row = { project_id: projectId, window_date: windowDate, started_by: deployWindowStarts.manual, ...columnsOf(promotion) };
	await insertRun(supabase, row);
}

async function forgetTimedWindow(supabase: SupabaseClient, projectId: string, windowDate: string): Promise<void> {
	const { error } = await supabase
		.from(deployWindowsTable)
		.delete()
		.eq('project_id', projectId)
		.eq('window_date', windowDate)
		.eq('started_by', deployWindowStarts.window);
	if (error) throw error;
}

async function insertRun(supabase: SupabaseClient, row: Record<string, unknown>): Promise<void> {
	const { error } = await supabase.from(deployWindowsTable).insert({ ran_at: new Date().toISOString(), ...row });
	if (error) throw error;
}

function columnsOf(promotion: Promotion): Record<string, unknown> {
	return { outcome: promotion.outcome, pull_request_url: promotion.pullRequestUrl, note: promotion.note };
}
