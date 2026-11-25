import type { SupabaseClient } from '@supabase/supabase-js';
import { designReviewHoldRefusal, isHeldForDesignReview } from '$lib/data/designReview';
import { lifecycleOutcomes, lifecycleSteps } from '$lib/data/lifecycleStep';
import { isGoalSubject, type ConversationSubject } from '$lib/server/conversations/conversationSubject';
import { getTask } from '$lib/server/projects/getTask';
import type { LifecycleStepInput } from '$lib/data/validateLifecycleStep';

/** A task waiting for YBT's approval of a design change can be considered, but never found buildable or built. */
export async function designReviewStepRefusal(
	supabase: SupabaseClient,
	subject: ConversationSubject,
	step: LifecycleStepInput
): Promise<string | null> {
	if (isGoalSubject(subject) || !isBuildingStep(step)) return null;
	const task = await getTask(supabase, subject.taskId);
	if (!isHeldForDesignReview(task?.designReview ?? null)) return null;
	return designReviewHoldRefusal;
}

function isBuildingStep(step: LifecycleStepInput): boolean {
	const isFoundBuildable = step.step === lifecycleSteps.considered && step.outcome === lifecycleOutcomes.buildable;
	return isFoundBuildable || step.step === lifecycleSteps.building;
}
