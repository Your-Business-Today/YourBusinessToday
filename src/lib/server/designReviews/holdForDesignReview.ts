import type { SupabaseClient } from '@supabase/supabase-js';
import { designReviewStates } from '$lib/data/designReview';

/** Puts a task already raised into the requested stage: it waits for YBT and is not buildable until approved. */
export async function holdForDesignReview(supabase: SupabaseClient, taskId: string, change: string): Promise<void> {
	const { error } = await supabase
		.from('tasks')
		.update({
			design_review_state: designReviewStates.awaiting,
			design_change: change,
			design_review_reason: null,
			design_reviewed_by: null,
			design_reviewed_at: null,
			is_buildable: false
		})
		.eq('id', taskId);
	if (error) throw error;
}
