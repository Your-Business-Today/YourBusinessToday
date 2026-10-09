import { conversationAccountIds } from '$lib/server/conversations/conversationAccountIds';
import { describeGoal, goalLine, noSuchGoal } from './describeGoal';
import { findGoals } from '$lib/server/goals/findGoals';
import { findTasks } from '$lib/server/support/findTasks';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { getThread } from '$lib/server/conversations/getThread';
import { noReachableProject, ownsProject, reachableGoal, reachableProject } from '../projectAccess';
import { objectSchema, readText, textField } from '../actionTypes';
import { withProjectAccess } from './withProjectAccess';
import type { Goal } from '$lib/server/goals/goalRecord';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

export const projectIdField = textField(
	'The project id, as given by list_my_projects or list_projects'
);
export const goalIdField = textField('The goal id, as given by find_goals');

export const goalReadActions: McpAction[] = [
	{
		name: 'find_goals',
		area: 'goals',
		audience: 'everyone',
		isWrite: false,
		summary:
			'search a project for the goal something relates to — leave the words out to list every goal',
		guidance:
			'Search before you create. Put what the person is trying to achieve in a few words; ' +
			'if a goal here already covers it, work under that one rather than adding another.',
		inputSchema: objectSchema(
			{ projectId: projectIdField, words: textField('A few words from the goal you have in mind') },
			['projectId']
		),
		run: async (caller, input) => {
			const project = await reachableProject(caller, readText(input, 'projectId'));
			if (project === null) return noReachableProject;
			const goals = await findGoals(caller.supabase, project.id, readText(input, 'words'));
			if (goals.length === 0)
				return `No goal on ${project.name} matches. Widen the words, or offer to create one.`;
			return goals.map(goalLine).join('\n');
		}
	},
	{
		name: 'read_goal',
		area: 'goals',
		audience: 'everyone',
		isWrite: false,
		summary: 'one goal in full: its measure, the tasks under it, and the whole conversation on it',
		inputSchema: objectSchema({ goalId: goalIdField }, ['goalId']),
		run: async (caller, input) => {
			const goal = await reachableGoal(caller, readText(input, 'goalId'));
			return withProjectAccess(caller, goal, noSuchGoal, (reachableGoal) =>
				readGoalInFull(caller, reachableGoal)
			);
		}
	}
];

async function readGoalInFull(caller: McpCaller, goal: Goal): Promise<string> {
	const tasks = await findTasks(caller.supabase, {
		projectId: goal.projectId,
		goalId: goal.id,
		phrase: ''
	});
	const messages = await getThread(
		caller.supabase,
		{ goalId: goal.id },
		ownsProject(caller, goal.projectId)
	);
	const authorIds = conversationAccountIds(messages);
	const accounts = await getAccountsById(caller.supabase, authorIds);
	return describeGoal(goal, tasks, messages, accounts);
}
