import { reachableGoal } from '../projectAccess';
import { deleteGoal } from '$lib/server/goals/deleteGoal';
import { goalIdField } from './goalReadActions';
import { goalHorizonOrder, parseGoalHorizon } from '$lib/data/goalHorizon';
import { noSuchGoal } from './describeGoal';
import { setGoalHorizon } from '$lib/server/goals/setGoalHorizon';
import { objectSchema, proseField, readOptionalText, readText, textField } from '../actionTypes';
import { updateGoal } from '$lib/server/goals/updateGoal';
import type { McpAction } from '../actionTypes';

const keepText = ' — leave out to keep what is there';

export const goalEditActions: McpAction[] = [
	{
		name: 'update_goal',
		area: 'goals',
		audience: 'everyone',
		isWrite: true,
		summary: 'reword a goal, change how it will be measured, or move it between current and long term',
		guidance:
			'A goal stays high level and measurable. If the measure is being rewritten, say how both ' +
			'sides will know it has been met. Its tasks mark it met; use set_goal_status to drop it. ' +
			'Moving a goal to the other horizon puts it last among the goals there.',
		inputSchema: objectSchema(
			{
				goalId: goalIdField,
				title: textField(`The goal in one line${keepText}`),
				measure: proseField(`How we will know it is met${keepText}`),
				horizon: textField(`One of ${goalHorizonOrder.join(', ')}${keepText}`)
			},
			['goalId']
		),
		run: async (caller, input) => {
			const goal = await reachableGoal(caller, readText(input, 'goalId'));
			if (goal === null) return noSuchGoal;
			const title = readOptionalText(input, 'title') ?? goal.title;
			const measure = readOptionalText(input, 'measure') ?? goal.measure;
			const askedHorizon = readOptionalText(input, 'horizon');
			const horizon = askedHorizon === null ? goal.horizon : parseGoalHorizon(askedHorizon);
			await updateGoal(caller.supabase, goal.id, { title, measure, status: goal.status });
			await setGoalHorizon(caller.supabase, goal.id, horizon);
			return `"${title}" saved as a ${horizon} goal. Measure: ${measure === '' ? 'none written' : measure}.`;
		}
	},
	{
		name: 'delete_goal',
		area: 'goals',
		audience: 'everyone',
		isWrite: true,
		summary: 'delete a goal and its conversation — the tasks under it stay, with no goal',
		guidance:
			'This cannot be undone. A goal that was pursued and abandoned is dropped with ' +
			'set_goal_status, so the record stays; delete only what was created by mistake.',
		inputSchema: objectSchema({ goalId: goalIdField }, ['goalId']),
		run: async (caller, input) => {
			const goal = await reachableGoal(caller, readText(input, 'goalId'));
			if (goal === null) return noSuchGoal;
			await deleteGoal(caller.supabase, goal.id);
			return `"${goal.title}" deleted. Its tasks are still on the project, under no goal.`;
		}
	}
];
