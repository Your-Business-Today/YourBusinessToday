import { countStagedTasks } from './countStagedTasks';
import { departmentTabs } from '$lib/data/departmentBoard';
import { developmentTabCountsOf, type DevelopmentTabCounts } from '$lib/components/projects/developmentTabCounts';
import { getGoalsForProject } from '$lib/server/goals/getGoalsForProject';
import { getTasksForProject } from './getTasksForProject';
import { readTogether } from '$lib/server/http/readTogether';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The counts on Development's tabs, for a page beneath the project that does not read the board itself. */
export async function readDevelopmentTabCounts(
	supabase: SupabaseClient,
	projectId: string
): Promise<DevelopmentTabCounts> {
	const { tasks, goals, stagedTaskCount } = await readTogether({
		tasks: getTasksForProject(supabase, projectId),
		goals: getGoalsForProject(supabase, projectId),
		stagedTaskCount: countStagedTasks(supabase, projectId)
	});
	return developmentTabCountsOf(departmentTabs(tasks, goals), stagedTaskCount);
}
