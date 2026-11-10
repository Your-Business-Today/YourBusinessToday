import type { SupabaseClient } from '@supabase/supabase-js';
import { describeProjectState } from './describeProjectState';
import { getGoalsForProject } from '$lib/server/goals/getGoalsForProject';
import { getPeopleOnProject } from '$lib/server/members/getPeopleOnProject';
import { getTasksForProject } from '$lib/server/projects/getTasksForProject';
import { getTaskTurns } from '$lib/server/conversations/conversationTurns';
import { projectStateOf } from '$lib/server/projects/projectState';
import type { Project } from '$lib/server/projects/projectRecord';

/** How one project stands now, as read_project_state gives it and the project card shows it. */
export async function describeHowProjectStands(supabase: SupabaseClient, project: Project, now: Date): Promise<string> {
	const [tasks, goals, people] = await Promise.all([
		getTasksForProject(supabase, project.id),
		getGoalsForProject(supabase, project.id),
		getPeopleOnProject(supabase, project.id)
	]);
	const turnsByTask = await getTaskTurns(supabase, tasks.map((task) => task.id));
	const state = projectStateOf({ tasks, goals, turnsByTask, now });
	return describeProjectState({ projectName: project.name, state, people, now }).join('\n');
}
