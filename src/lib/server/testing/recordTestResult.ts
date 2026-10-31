import { connectorTaskAutocomplete } from '$lib/data/autocomplete';
import { withRaiserAutocomplete } from '$lib/data/autocompleteStanding';
import { postedViaChannels } from '$lib/data/conversationTurn';
import { fixTitlePrefix, testOutcomes, type TestResult } from '$lib/data/testResult';
import { taskKinds } from '$lib/data/taskKind';
import { createTask, type NewTaskSeed } from '$lib/server/projects/createTask';
import { postMessage } from '$lib/server/conversations/postMessage';
import type { ProjectTask } from '$lib/server/projects/taskRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

export type TestRecorder = { supabase: SupabaseClient; accountId: string; isStaff: boolean };

const nobodyAwaited = { postedVia: postedViaChannels.claude, awaiting: null };

/** Posts what was tried on the feature's task and, when it failed, raises the FIX beside it; answers the FIX's id. */
export async function recordTestResult(
	recorder: TestRecorder,
	task: ProjectTask,
	result: TestResult
): Promise<string | null> {
	const { supabase, accountId } = recorder;
	const fixId = await raiseFixFor(recorder, task, result);
	const body = resultMessage(result, fixId);
	await postMessage(supabase, { taskId: task.id }, accountId, body, nobodyAwaited);
	return fixId;
}

function resultMessage(result: TestResult, fixId: string | null): string {
	if (fixId === null) return `Tested and confirmed: ${result.proof}`;
	return `Tested and failed: ${result.proof}\n\nRaised as "${fixTitlePrefix}${result.fault}" (task id: ${fixId}).`;
}

async function raiseFixFor(recorder: TestRecorder, task: ProjectTask, result: TestResult): Promise<string | null> {
	if (result.outcome === testOutcomes.confirmed || result.fault === null) return null;
	const seed = withRaiserAutocomplete(fixSeed(task, result.fault, result.proof), recorder.isStaff);
	return createTask(recorder.supabase, task.projectId, seed, recorder.accountId);
}

/** A failed test's FIX: under the same goal as the feature, built by Claude like any other fix. */
export function fixSeed(task: ProjectTask, fault: string, proof: string): NewTaskSeed {
	return {
		title: `${fixTitlePrefix}${fault}`,
		details: `Found testing "${task.title}" (task id: ${task.id}).\n\n${proof}`,
		dueDate: null,
		parentTaskId: null,
		waitsForTaskId: null,
		goalId: task.goalId,
		kind: taskKinds.work,
		autocomplete: connectorTaskAutocomplete
	};
}
