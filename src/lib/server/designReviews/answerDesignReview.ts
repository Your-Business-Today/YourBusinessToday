import type { SupabaseClient } from '@supabase/supabase-js';
import { postedViaChannels } from '$lib/data/conversationTurn';
import { designReviewStates, type DesignReviewState } from '$lib/data/designReview';
import { postMessage } from '$lib/server/conversations/postMessage';
import { settleOpenQuestions } from '$lib/server/conversations/settleOpenQuestions';

export type DesignAnswer = { taskId: string; state: DesignReviewState; reason: string; answeredBy: string };

const answerOpenings: Record<DesignReviewState, string> = {
	awaiting: '',
	approved: 'YBT approved this change to the design, so it can be built.',
	rejected:
		'YBT turned this change to the design down, so it will not be built. Talk the need through again ' +
		'and raise it in the shape the system already has, or delete this request.'
};

/** Records YBT's answer on the task, settles the ask it answers and tells whoever asked for it why. */
export async function answerDesignReview(supabase: SupabaseClient, answer: DesignAnswer): Promise<void> {
	const { error } = await supabase
		.from('tasks')
		.update({
			design_review_state: answer.state,
			design_review_reason: answer.reason === '' ? null : answer.reason,
			design_reviewed_by: answer.answeredBy,
			design_reviewed_at: new Date().toISOString(),
			...unbuildableWhenRejected(answer.state)
		})
		.eq('id', answer.taskId);
	if (error) throw error;
	const subject = { taskId: answer.taskId };
	await settleOpenQuestions(supabase, subject);
	const reason = answer.reason === '' ? '' : `\n\nThe reason: ${answer.reason}`;
	const origin = { postedVia: postedViaChannels.claude, awaiting: null };
	await postMessage(supabase, subject, answer.answeredBy, `${answerOpenings[answer.state]}${reason}`, origin);
}

function unbuildableWhenRejected(state: DesignReviewState): Record<string, unknown> {
	if (state !== designReviewStates.rejected) return {};
	return { is_buildable: false };
}
