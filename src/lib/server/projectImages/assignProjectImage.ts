import type { SupabaseClient } from '@supabase/supabase-js';
import type { ProjectImage } from './projectImageRecord';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

/** The image becomes the task's attachment under the same id and file, and leaves the bank. */
export async function assignProjectImage(
	supabase: SupabaseClient,
	image: ProjectImage,
	task: ProjectTask
): Promise<boolean> {
	const { data: isAssigned, error } = await supabase.rpc('assign_project_image', {
		image_id: image.id,
		target_task_id: task.id
	});
	if (error !== null) throw error;
	return isAssigned === true;
}
