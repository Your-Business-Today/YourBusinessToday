import {
	autocompleteChoices,
	autocompleteChoiceRefusal,
	autocompleteWord,
	autocompleteSentence,
	validateAutocompleteChoice,
	validateGoalAutocompleteSwitch
} from '$lib/data/autocomplete';
import { noSuchGoal } from './describeGoal';
import { noSuchTask } from './describeTask';
import { objectSchema, readText, textField } from '../actionTypes';
import { reachableGoal, reachableTask } from '../projectAccess';
import { registerReadAction } from './autocompleteRegisterAction';
import { setGoalAutocomplete } from '$lib/server/goals/setGoalAutocomplete';
import { setTaskAutocomplete } from '$lib/server/projects/setTaskAutocomplete';
import type { McpAction } from '../actionTypes';

const autocompleteGuidance =
	'Autocomplete lets an AI running on a schedule take the work through to a merged pull ' +
	'request without asking anyone; turn it off where a person must give input first. Every ' +
	'goal starts on. A person who turned it off is never overridden.';

const choiceList = Object.values(autocompleteChoices).join(', ');

export const autocompleteActions: McpAction[] = [
	{
		name: 'set_goal_autocomplete',
		area: 'goals',
		audience: 'everyone',
		isWrite: true,
		summary:
			'turn autocomplete on or off for a goal — its tasks follow it unless they have their own setting',
		guidance: autocompleteGuidance,
		inputSchema: objectSchema(
			{
				goalId: textField('The goal id'),
				isAutocomplete: {
					type: 'boolean',
					description: 'true to let scheduled AIs complete its tasks'
				}
			},
			['goalId', 'isAutocomplete']
		),
		run: async (caller, input) => {
			const goal = await reachableGoal(caller, readText(input, 'goalId'));
			if (goal === null) return noSuchGoal;
			const isAutocomplete = validateGoalAutocompleteSwitch(input.isAutocomplete);
			if (isAutocomplete === undefined) return 'isAutocomplete is true or false.';
			await setGoalAutocomplete(caller.supabase, goal.id, isAutocomplete);
			return `"${goal.title}" is now autocomplete ${autocompleteWord(isAutocomplete)}.`;
		}
	},
	{
		name: 'set_task_autocomplete',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary: 'turn autocomplete on or off for one task, or let it follow its goal',
		guidance: autocompleteGuidance,
		inputSchema: objectSchema(
			{ taskId: textField('The task id'), autocomplete: textField(`One of ${choiceList}`) },
			['taskId', 'autocomplete']
		),
		run: async (caller, input) => {
			const task = await reachableTask(caller, readText(input, 'taskId'));
			if (task === null) return noSuchTask;
			const setting = validateAutocompleteChoice(readText(input, 'autocomplete'));
			if (setting === undefined) return autocompleteChoiceRefusal;
			await setTaskAutocomplete(caller.supabase, task.id, setting);
			const goal = task.goalId === null ? null : await reachableGoal(caller, task.goalId);
			return `"${task.title}": ${autocompleteSentence(setting, goal?.isAutocomplete ?? null)}`;
		}
	},
	registerReadAction
];
