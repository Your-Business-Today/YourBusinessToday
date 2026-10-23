import type { SupabaseClient } from '@supabase/supabase-js';
import { isGoalSubject, subjectColumns, type ConversationSubject } from '$lib/server/conversations/conversationSubject';
import { startTask } from '$lib/server/projects/startTask';
import { startsTheWork } from '$lib/data/workStarted';
import type { LifecycleStepInput } from '$lib/data/validateLifecycleStep';

const nobodySignedIn = null;

/**
 * Add one step to a goal's or a task's lifecycle; steps are never changed once recorded. A step
 * that starts the work moves its task out of the backlog, so the board shows what is being built.
 */
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
	if (isGoalSubject(subject) || !startsTheWork(step.step)) return;
	await startTask(supabase, subject.taskId, nobodySignedIn);
}
