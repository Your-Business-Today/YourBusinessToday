import type { SupabaseClient } from '@supabase/supabase-js';
import { designReviewHoldRefusal } from '$lib/data/designReview';
import { isHeldWithItsParent } from '$lib/server/designReviews/isHeldWithItsParent';
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
	if (task === null) return null;
	const isHeld = await isHeldWithItsParent(supabase, task);
	if (!isHeld) return null;
	return designReviewHoldRefusal;
}

function isBuildingStep(step: LifecycleStepInput): boolean {
	const isFoundBuildable = step.step === lifecycleSteps.considered && step.outcome === lifecycleOutcomes.buildable;
	return isFoundBuildable || step.step === lifecycleSteps.building;
}
