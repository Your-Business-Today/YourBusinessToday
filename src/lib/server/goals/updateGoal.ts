import type { SupabaseClient } from '@supabase/supabase-js';
import { parseGoalStatus, type GoalStatus } from '$lib/data/goalStatus';

export type GoalUpdate = {
	title: string;
	measure: string;
	status: GoalStatus;
};

export function readGoalUpdate(formData: FormData): GoalUpdate | null {
	const title = String(formData.get('title') ?? '').trim();
	if (title === '') return null;
	return {
		title,
		measure: String(formData.get('measure') ?? '').trim(),
		status: parseGoalStatus(formData.get('status'))
	};
}

export async function updateGoal(
	supabase: SupabaseClient,
	goalId: string,
	update: GoalUpdate
): Promise<void> {
	const { error } = await supabase
		.from('goals')
		.update({ title: update.title, measure: update.measure, status: update.status })
		.eq('id', goalId);
	if (error) throw error;
}

/** The status the goal settles on: open and met follow its tasks once it has any (migration 0069). */
export async function updateGoalStatus(
	supabase: SupabaseClient,
	goalId: string,
	status: GoalStatus
): Promise<GoalStatus> {
	const { data, error } = await supabase
		.from('goals')
		.update({ status })
		.eq('id', goalId)
		.select('status')
		.single();
	if (error) throw error;
	return parseGoalStatus(data.status);
}
