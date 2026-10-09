import type { SupabaseClient } from '@supabase/supabase-js';
import { parseGoalRecord, type Goal } from './goalRecord';

export async function getGoalsForProject(supabase: SupabaseClient, projectId: string): Promise<Goal[]> {
	const { data, error } = await supabase
		.from('goals')
		.select('*')
		.eq('project_id', projectId)
		.order('horizon', { ascending: true })
		.order('priority', { ascending: true });
	if (error) throw error;
	return data.map(parseGoalRecord);
}
