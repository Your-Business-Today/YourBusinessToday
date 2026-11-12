import { countStagedTasks } from './countStagedTasks';
import { departmentTabs, goalsForBoardTabs, inBoardTabs } from '$lib/data/departmentBoard';
import { developmentTabCountsOf } from '$lib/components/projects/developmentTabCounts';
import { getGoalsForProject } from '$lib/server/goals/getGoalsForProject';
import { getPeopleOnProject } from '$lib/server/members/getPeopleOnProject';
import { getTaskTurns } from '$lib/server/conversations/conversationTurns';
import { getTasksForProject } from './getTasksForProject';
import { projectStateOf } from './projectState';
import { readTogether } from '$lib/server/http/readTogether';
import { summariseGoals } from '$lib/server/goals/summariseGoals';
import { tabsOnBoardSide } from '$lib/data/boardSide';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Development's Goals tab: how the project stands, and every goal its bugs, features and infrastructure serve. */
export async function readDevelopmentGoals(supabase: SupabaseClient, projectId: string) {
	const tasksRead = getTasksForProject(supabase, projectId);
	const { projectTasks, projectGoals, people, turnsByTask, stagedTaskCount } = await readTogether({
		projectTasks: tasksRead,
		projectGoals: getGoalsForProject(supabase, projectId),
		people: getPeopleOnProject(supabase, projectId),
		turnsByTask: tasksRead.then((tasks) =>
			getTaskTurns(
				supabase,
				tasks.map((task) => task.id)
			)
		),
		stagedTaskCount: countStagedTasks(supabase, projectId)
	});
	const developmentTabs = tabsOnBoardSide.development;
	const developmentTasks = inBoardTabs(projectTasks, developmentTabs);
	const developmentGoals = goalsForBoardTabs(projectGoals, developmentTasks, developmentTabs);
	return {
		people,
		projectState: projectStateOf({
			tasks: projectTasks,
			goals: projectGoals,
			turnsByTask,
			now: new Date()
		}),
		goalSummaries: summariseGoals(developmentGoals, developmentTasks),
		developmentTabCounts: developmentTabCountsOf(departmentTabs(projectTasks, projectGoals), stagedTaskCount)
	};
}
