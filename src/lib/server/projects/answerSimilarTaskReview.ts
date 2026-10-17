import type { SupabaseClient } from '@supabase/supabase-js';
import type { ReviewDecision } from '$lib/data/similarTaskReview';

const refusalCode = 'P0001';

export type ReviewAnswer = { reviewId: string; decision: ReviewDecision; reviewerId: string };

/** Apply the reviewer's answer; the refusal the database gives (not theirs, already answered) comes back as a sentence. */
export async function answerSimilarTaskReview(
	supabase: SupabaseClient,
	answer: ReviewAnswer
): Promise<string | null> {
	const { error } = await supabase.rpc('answer_similar_task_review', {
		review_id: answer.reviewId,
		answer: answer.decision,
		acting_account: answer.reviewerId
	});
	if (error === null) return null;
	if (error.code === refusalCode) return error.message;
	throw error;
}
