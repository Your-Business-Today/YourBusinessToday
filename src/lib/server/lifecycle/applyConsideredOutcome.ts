import type { SupabaseClient } from '@supabase/supabase-js';
import { isGoalSubject, type ConversationSubject } from '$lib/server/conversations/conversationSubject';
import { lifecycleOutcomes, lifecycleSteps } from '$lib/data/lifecycleStep';
import { setTaskBuildableFlag } from '$lib/server/projects/setTaskBuildable';
import type { LifecycleStepInput } from '$lib/data/validateLifecycleStep';

/** A task considered buildable is tagged buildable; considered with any other outcome, it is not. */
export async function applyConsideredOutcome(
	supabase: SupabaseClient,
	subject: ConversationSubject,
	step: LifecycleStepInput
): Promise<void> {
	if (isGoalSubject(subject)) return;
	if (step.step !== lifecycleSteps.considered) return;
	const isBuildable = step.outcome === lifecycleOutcomes.buildable;
	await setTaskBuildableFlag(supabase, subject.taskId, isBuildable);
}
