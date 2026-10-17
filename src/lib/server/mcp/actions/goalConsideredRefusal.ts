import type { SupabaseClient } from '@supabase/supabase-js';
import { getLifecycleSteps } from '$lib/server/lifecycle/getLifecycleSteps';
import { getOpenGoalTasks, getTasksSteppedSince } from '$lib/server/lifecycle/goalConsideration';
import { lifecycleSteps } from '$lib/data/lifecycleStep';
import type { LifecycleStep } from '$lib/server/lifecycle/lifecycleStepRecord';
import type { ResolvedSubject } from './resolveSubject';

const titlesNamed = 8;

const considerFirst =
	'Record considering on the goal first, then a step on each of its open tasks, then considered.';

/** A goal is considered only once the agent has recorded a step on each of its open tasks. */
export async function goalConsideredRefusal(
	supabase: SupabaseClient,
	resolved: ResolvedSubject,
	agent: string
): Promise<string | null> {
	const steps = await getLifecycleSteps(supabase, resolved.subject);
	const start = steps.findLast((step) => isConsideringBy(step, agent));
	if (start === undefined) return considerFirst;
	const goalId = start.goalId as string;
	const openTasks = await getOpenGoalTasks(supabase, goalId);
	const taskIds = openTasks.map((task) => task.id);
	const stepped = await getTasksSteppedSince(supabase, taskIds, agent, start.createdAt);
	const unstepped = openTasks.filter((task) => !stepped.has(task.id));
	if (unstepped.length === 0) return null;
	const named = unstepped.slice(0, titlesNamed).map((task) => `"${task.title}" (id: ${task.id})`);
	const more = unstepped.length > titlesNamed ? ` and ${unstepped.length - titlesNamed} more` : '';
	return (
		'Before the goal is considered, record a step on each of its open tasks since you began ' +
		`considering it, even one that only says what it still waits for. Still to do: ${named.join(', ')}${more}.`
	);
}

function isConsideringBy(step: LifecycleStep, agent: string): boolean {
	const isConsidering = step.step === lifecycleSteps.considering;
	return isConsidering && step.agent === agent;
}
