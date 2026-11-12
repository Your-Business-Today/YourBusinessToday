import type { SupabaseClient } from '@supabase/supabase-js';

/** The projects a person is on, in their own order for them. */
export async function getMemberProjectIds(
	supabase: SupabaseClient,
	accountId: string
): Promise<string[]> {
	const { data, error } = await supabase
		.from('project_members')
		.select('project_id')
		.eq('account_id', accountId)
		.order('priority', { ascending: true });
	if (error) throw error;
	return data.map((row: Record<string, unknown>) => row.project_id as string);
}
