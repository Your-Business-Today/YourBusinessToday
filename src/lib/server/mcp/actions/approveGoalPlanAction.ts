import { designReviewStageName } from '$lib/data/designReview';
import { approveGoalPlan } from '$lib/server/designReviews/approveGoalPlan';
import { objectSchema, readText, textField } from '../actionTypes';
import { reachableGoal } from '../projectAccess';
import type { McpAction } from '../actionTypes';

const noSuchGoal = 'No goal with that id is on a project you can reach.';

/** YBT staff accept a goal's plan, approving every request under it so the goal moves to the board as one. */
export const approveGoalPlanAction: McpAction = {
	name: 'approve_goal_plan',
	area: 'goals',
	audience: 'staff',
	isWrite: true,
	summary: `approve every request a goal holds in ${designReviewStageName}, accepting the goal's plan`,
	guidance:
		'A goal holding a request that changes the design waits on Requested whole, with every task under it, ' +
		'and nothing under it is built, so no feature is half built before the bigger decision is taken. ' +
		'Approving the goal accepts its plan going forward: every request under it is approved together and the ' +
		'goal moves back to the board. Given only on a YBT director’s yes in this chat, after showing them the ' +
		'goal, its tasks and what each request changes. To turn one request down, use reject_design_change.',
	inputSchema: objectSchema({ goalId: textField('The goal id') }, ['goalId']),
	run: async (caller, input) => {
		const goal = await reachableGoal(caller, readText(input, 'goalId'));
		if (goal === null) return noSuchGoal;
		const plan = { projectId: goal.projectId, goalId: goal.id, answeredBy: caller.accountId };
		const approved = await approveGoalPlan(caller.supabase, plan);
		if (approved.length === 0) return `"${goal.title}" holds nothing ${designReviewStageName.toLowerCase()}.`;
		const titles = approved.map((task) => `- ${task.title}`).join('\n');
		return `"${goal.title}": its plan is approved, and it is back on the board. Approved:\n${titles}`;
	}
};
