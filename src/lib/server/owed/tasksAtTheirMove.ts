import { isNextActionWith, nextActionReasons, type NextAction } from '$lib/data/nextAction';
import { getNextActionsByTask } from '$lib/server/projects/getNextActionsByTask';
import type { GlobalTask } from '$lib/server/projects/getGlobalTaskPage';
import type { OwingPerson } from './owingPerson';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * A person's open tasks split by the next-action rule. Assigned: tasks of theirs whose next move is
 * theirs. Follow-ups: tasks not assigned to them that came back to them, an answered ask of
 * theirs or a job they raised that nobody took. A task whose move is an ask waiting on them is
 * listed with the asks, and one whose move is someone else's or a build's is not theirs.
 */
export type TasksAtTheirMove = { assigned: GlobalTask[]; followUps: GlobalTask[] };

export async function getTasksAtTheirMove(
	supabase: SupabaseClient,
	person: OwingPerson,
	assigned: GlobalTask[],
	followUpCandidates: GlobalTask[]
): Promise<TasksAtTheirMove> {
	const assignedIds = new Set(assigned.map((task) => task.id));
	const candidates = followUpCandidates.filter((task) => !assignedIds.has(task.id));
	const nextActions = await getNextActionsByTask(supabase, [...assigned, ...candidates]);
	const isTheirMove = (task: GlobalTask) => isMoveTheirsOutsideAnAsk(nextActions.get(task.id), person.accountIds);
	return { assigned: assigned.filter(isTheirMove), followUps: candidates.filter(isTheirMove) };
}

function isMoveTheirsOutsideAnAsk(nextAction: NextAction | undefined, accountIds: string[]): boolean {
	if (nextAction === undefined) return false;
	if (nextAction.reason === nextActionReasons.ask) return false;
	return isNextActionWith(nextAction, accountIds);
}
