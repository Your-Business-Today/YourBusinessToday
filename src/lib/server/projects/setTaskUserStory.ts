import type { SupabaseClient } from '@supabase/supabase-js';
import type { UserStory } from '$lib/data/userStoryRule';

export async function setTaskUserStory(
	supabase: SupabaseClient,
	taskId: string,
	story: UserStory
): Promise<void> {
	const { error } = await supabase
		.from('tasks')
		.update({
			is_user_story: true,
			story_role: story.role,
			story_want: story.want,
			story_benefit: story.benefit
		})
		.eq('id', taskId);
	if (error) throw error;
}
