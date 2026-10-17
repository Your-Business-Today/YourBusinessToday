import type { SupabaseClient } from '@supabase/supabase-js';
import type { SimilarTaskReview } from '$lib/data/similarTaskReview';

/** The reviews on this task still waiting on the person looking at it. */
export async function findReviewsWaitingOn(
	supabase: SupabaseClient,
	taskId: string,
	reviewerId: string
): Promise<SimilarTaskReview[]> {
	const { data, error } = await supabase
		.from('similar_task_reviews')
		.select('id, new_task_id, new_task_title, new_project_name')
		.eq('existing_task_id', taskId)
		.eq('reviewer_account_id', reviewerId)
		.is('decision', null)
		.order('created_at');
	if (error) throw error;
	return (data ?? []).map((row) => ({
		id: row.id,
		newTaskId: row.new_task_id,
		newTaskTitle: row.new_task_title,
		newProjectName: row.new_project_name
	}));
}
