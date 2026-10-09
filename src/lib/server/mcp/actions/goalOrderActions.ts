import { reachableGoal } from '../projectAccess';
import { goalIdField } from './goalReadActions';
import { moveGoal } from '$lib/server/goals/moveGoal';
import { noSuchGoal } from './describeGoal';
import { objectSchema, readText, textField } from '../actionTypes';
import { placeGoal } from '$lib/server/goals/placeGoal';
import { setGoalPriority } from '$lib/server/goals/setGoalPriority';
import {
	besidePlacementField,
	directionField,
	priorityField,
	readBesidePlacement,
	readMoveDirection,
	readPriority,
	sayWhichDirection,
	sayWhichPlacement,
	sayWhichPriority
} from './orderingFields';
import type { McpAction } from '../actionTypes';

const bothGoalsNeeded = 'Name the goal to move and the goal to place it beside.';
const sameHorizonNeeded =
	'Both goals must be current or both long term: move one with update_goal first.';

export const goalOrderActions: McpAction[] = [
	{
		name: 'set_goal_priority',
		area: 'goals',
		audience: 'everyone',
		isWrite: true,
		summary:
			'give a goal a priority number among the current or the long term goals of its project — the others shift to make room',
		guidance:
			'Goals are in priority order within each horizon of the project: 1 is what the project ' +
			'is for above all else. find_goals and read_project show each goal’s number.',
		inputSchema: objectSchema({ goalId: goalIdField, priority: priorityField('goal') }, [
			'goalId',
			'priority'
		]),
		run: async (caller, input) => {
			const goal = await reachableGoal(caller, readText(input, 'goalId'));
			if (goal === null) return noSuchGoal;
			const priority = readPriority(input);
			if (priority === null) return sayWhichPriority;
			await setGoalPriority(caller.supabase, goal.id, priority);
			return `"${goal.title}" is now priority ${priority} among the project’s ${goal.horizon} goals.`;
		}
	},
	{
		name: 'move_goal',
		area: 'goals',
		audience: 'everyone',
		isWrite: true,
		summary: 'move a goal one place up or down among the goals on its horizon',
		guidance: 'To give it a particular number in one call, use set_goal_priority.',
		inputSchema: objectSchema({ goalId: goalIdField, direction: directionField }, [
			'goalId',
			'direction'
		]),
		run: async (caller, input) => {
			const goal = await reachableGoal(caller, readText(input, 'goalId'));
			if (goal === null) return noSuchGoal;
			const direction = readMoveDirection(input);
			if (direction === null) return sayWhichDirection;
			await moveGoal(caller.supabase, goal.id, direction);
			return `"${goal.title}" moved ${direction}.`;
		}
	},
	{
		name: 'place_goal',
		area: 'goals',
		audience: 'everyone',
		isWrite: true,
		summary: 'place a goal directly before or after another goal on the same project',
		inputSchema: objectSchema(
			{
				goalId: goalIdField,
				targetGoalId: textField('The goal to place it beside'),
				placement: besidePlacementField
			},
			['goalId', 'targetGoalId', 'placement']
		),
		run: async (caller, input) => {
			const goal = await reachableGoal(caller, readText(input, 'goalId'));
			const targetGoal = await reachableGoal(caller, readText(input, 'targetGoalId'));
			if (goal === null || targetGoal === null) return bothGoalsNeeded;
			if (goal.projectId !== targetGoal.projectId) return 'Both goals must be on one project.';
			if (goal.horizon !== targetGoal.horizon) return sameHorizonNeeded;
			const placement = readBesidePlacement(input);
			if (placement === null) return sayWhichPlacement;
			await placeGoal(caller.supabase, goal.id, targetGoal.id, placement);
			return `"${goal.title}" now sits ${placement} "${targetGoal.title}".`;
		}
	}
];
