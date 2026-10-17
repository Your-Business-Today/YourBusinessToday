import { isUuid } from '$lib/data/isUuid';
import {
	reviewDecisionLabels,
	reviewDecisionRefusal,
	reviewDecisions,
	validateReviewDecision
} from '$lib/data/similarTaskReview';
import { answerSimilarTaskReview } from '$lib/server/projects/answerSimilarTaskReview';
import { objectSchema, readText, textField } from '../actionTypes';
import type { McpAction } from '../actionTypes';

const decisionChoices = Object.values(reviewDecisions).join(', ');

export const similarTaskReviewActions: McpAction[] = [
	{
		name: 'answer_similar_task_review',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary: 'say what becomes of your task when someone raised one like it anyway',
		guidance:
			'When a task is raised anyway though it looks like one of yours, a question waits on you on ' +
			'your task, carrying its review id. Ask the person, then answer with their choice: keeping both ' +
			'leaves the two tasks as they are; merging puts the new task’s details onto yours and closes ' +
			'the new one; replacing closes yours, pointing at the new one. Answering clears it from waiting on you.',
		inputSchema: objectSchema(
			{
				reviewId: textField('The review id the question on your task gives'),
				decision: textField(decisionChoices)
			},
			['reviewId', 'decision']
		),
		run: async (caller, input) => {
			const reviewId = readText(input, 'reviewId');
			if (!isUuid(reviewId)) return 'Give the review id the question on your task carries.';
			const decision = validateReviewDecision(input.decision);
			if (decision === null) return reviewDecisionRefusal;
			const answer = { reviewId, decision, reviewerId: caller.accountId };
			const refusal = await answerSimilarTaskReview(caller.supabase, answer);
			if (refusal !== null) return refusal;
			return `Answered: ${reviewDecisionLabels[decision]}.`;
		}
	}
];
