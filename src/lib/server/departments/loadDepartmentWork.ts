import { chosenDepartment, departmentTabs, goalsForDepartment, inDepartment } from '$lib/data/departmentBoard';
import { getGoalsForProject } from '$lib/server/goals/getGoalsForProject';
import { getTasksForProject } from '$lib/server/projects/getTasksForProject';
import type { SupabaseClient } from '@supabase/supabase-js';

/** A project's work as one department tab shows it, with every task kept for waits that cross departments. */
export async function loadDepartmentWork(supabase: SupabaseClient, projectId: string, url: URL) {
	const department = chosenDepartment(url);
	const projectTasks = await getTasksForProject(supabase, projectId);
	const projectGoals = await getGoalsForProject(supabase, projectId);
	const tasks = inDepartment(projectTasks, department);
	return {
		projectTasks,
		tasks,
		goals: goalsForDepartment(projectGoals, tasks, department),
		department,
		departmentTabs: departmentTabs(projectTasks)
	};
}
