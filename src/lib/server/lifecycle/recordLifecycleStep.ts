import type { SupabaseClient } from '@supabase/supabase-js';
import { subjectColumns, type ConversationSubject } from '$lib/server/conversations/conversationSubject';
import type { LifecycleStepInput } from '$lib/data/validateLifecycleStep';

/** Add one step to a goal's or a task's lifecycle; steps are never changed once recorded. */
export async function recordLifecycleStep(
	supabase: SupabaseClient,
	projectId: string,
	subject: ConversationSubject,
	step: LifecycleStepInput
): Promise<void> {
	const { error } = await supabase.from('lifecycle_steps').insert({
		project_id: projectId,
		...subjectColumns(subject),
		step: step.step,
		outcome: step.outcome,
		agent: step.agent,
		model: step.model,
		run_url: step.runUrl,
		branch_name: step.branchName,
		note: step.note
	});
	if (error) throw error;
}
