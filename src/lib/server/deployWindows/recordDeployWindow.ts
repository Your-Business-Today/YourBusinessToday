import type { SupabaseClient } from '@supabase/supabase-js';
import type { Promotion } from './promoteStaging';

/** Keeps the day's window as the project's one row for that date; a window tried again after failing replaces it. */
export async function recordDeployWindow(
	supabase: SupabaseClient,
	projectId: string,
	windowDate: string,
	promotion: Promotion
): Promise<void> {
	const { error } = await supabase.from('project_deploy_windows').upsert(
		{
			project_id: projectId,
			window_date: windowDate,
			ran_at: new Date().toISOString(),
			outcome: promotion.outcome,
			pull_request_url: promotion.pullRequestUrl,
			note: promotion.note
		},
		{ onConflict: 'project_id,window_date' }
	);
	if (error) throw error;
}
