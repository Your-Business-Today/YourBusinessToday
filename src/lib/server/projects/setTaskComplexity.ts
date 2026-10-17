import type { SupabaseClient } from '@supabase/supabase-js';
import { storyPointsForComplexity, type TaskComplexity } from '$lib/data/taskComplexity';

/** Record a task's four measures and the story points the formula gives them; answers the points. */
export async function setTaskComplexity(
	supabase: SupabaseClient,
	taskId: string,
	complexity: TaskComplexity
): Promise<number> {
	const storyPoints = storyPointsForComplexity(complexity);
	const { error } = await supabase
		.from('tasks')
		.update({
			views_changed: complexity.viewsChanged,
			new_views: complexity.newViews,
			changes_data_structure: complexity.changesDataStructure,
			domain_objects: complexity.domainObjects,
			story_points: storyPoints
		})
		.eq('id', taskId);
	if (error) throw error;
	return storyPoints;
}
