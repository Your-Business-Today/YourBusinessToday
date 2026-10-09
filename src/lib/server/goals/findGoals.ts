import type { SupabaseClient } from '@supabase/supabase-js';
import { parseGoalRecord, type Goal } from './goalRecord';
import { wordsOf, matchingAnyOf } from '$lib/server/search/wordMatch';

const mostMatches = 20;

export async function findGoals(
	supabase: SupabaseClient,
	projectId: string,
	phrase: string
): Promise<Goal[]> {
	let query = supabase.from('goals').select('*').eq('project_id', projectId);
	for (const word of wordsOf(phrase)) {
		query = query.or(matchingAnyOf(['title', 'measure'], word));
	}
	const { data, error } = await query.order('horizon').order('priority').limit(mostMatches);
	if (error) throw error;
	return data.map(parseGoalRecord);
}
