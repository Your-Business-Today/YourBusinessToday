import type { SupabaseClient } from '@supabase/supabase-js';
import type { TaskKind } from '$lib/data/taskKind';
import { doneTaskStatus, type TaskStatus } from '$lib/data/taskStatus';

export type TaskDetailsUpdate = {
	title: string;
	details: string;
	status: TaskStatus;
	dueDate: string | null;
	goalId: string | null;
	kind: TaskKind;
	storyPoints: number;
	completionPercent: number;
	isUserStory: boolean;
	storyRole: string;
	storyWant: string;
	storyBenefit: string;
};

export async function updateTaskDetails(
	supabase: SupabaseClient,
	taskId: string,
	update: TaskDetailsUpdate
): Promise<void> {
	const { error } = await supabase
		.from('tasks')
		.update({
			title: update.title,
			details: update.details,
			status: update.status,
			due_date: update.dueDate,
			goal_id: update.goalId,
			kind: update.kind,
			story_points: update.storyPoints,
			completion_percent: completionPercentFor(update),
			is_user_story: update.isUserStory,
			story_role: update.storyRole,
			story_want: update.storyWant,
			story_benefit: update.storyBenefit
		})
		.eq('id', taskId);
	if (error) throw error;
}

function completionPercentFor(update: TaskDetailsUpdate): number {
	if (update.status === doneTaskStatus) return 100;
	return update.completionPercent;
}
