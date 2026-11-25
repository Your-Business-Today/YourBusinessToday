import type { SupabaseClient } from '@supabase/supabase-js';
import { designReviewStates, isAwaitingDesignApproval } from '$lib/data/designReview';
import { getTasksForProject } from '$lib/server/projects/getTasksForProject';
import { answerDesignReview } from './answerDesignReview';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

export type GoalPlan = { projectId: string; goalId: string | null; answeredBy: string };

/**
 * YBT accepts a goal's plan: every request under the goal awaiting approval is approved together, and with them the
 * goal moves back to the board. With no goal, the requests that serve no goal are approved. Returns those approved.
 */
export async function approveGoalPlan(supabase: SupabaseClient, plan: GoalPlan): Promise<ProjectTask[]> {
	const tasks = await getTasksForProject(supabase, plan.projectId);
	const requests = tasks.filter((task) => isAwaitingDesignApproval(task) && task.goalId === plan.goalId);
	const approval = { state: designReviewStates.approved, reason: '', answeredBy: plan.answeredBy };
	for (const task of requests) await answerDesignReview(supabase, { taskId: task.id, ...approval });
	return requests;
}
