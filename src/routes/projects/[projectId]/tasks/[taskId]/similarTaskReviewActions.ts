import { fail } from '@sveltejs/kit';
import { isUuid } from '$lib/data/isUuid';
import { reviewDecisionRefusal, validateReviewDecision } from '$lib/data/similarTaskReview';
import { answerSimilarTaskReview } from '$lib/server/projects/answerSimilarTaskReview';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import type { Actions } from './$types';

export const similarTaskReviewActions = {
	answerSimilarTaskReview: async ({ locals, params, request }) => {
		const { user } = await requireProjectAccess(locals, params.projectId);
		const formData = await request.formData();
		const reviewId = String(formData.get('reviewId') ?? '');
		if (!isUuid(reviewId)) return fail(400, { message: 'That review is not one waiting on you.' });
		const decision = validateReviewDecision(formData.get('decision'));
		if (decision === null) return fail(400, { message: reviewDecisionRefusal });
		const refusal = await answerSimilarTaskReview(locals.supabase, { reviewId, decision, reviewerId: user.id });
		if (refusal !== null) return fail(400, { message: refusal });
		return { message: 'Answered.' };
	}
} satisfies Actions;
