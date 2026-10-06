import type { SupabaseClient } from '@supabase/supabase-js';
import { compactProjectBoard, compactTaskQueue } from '$lib/server/ordering/compactInDatabase';
import { getProject } from '$lib/server/projects/getProject';
import { getAttachmentPathsForProject, removeAttachmentFiles } from './attachmentFiles';
import { getProjectImagePaths } from '$lib/server/projectImages/getProjectImages';

export async function deleteProject(supabase: SupabaseClient, projectId: string): Promise<void> {
	const project = await getProject(supabase, projectId);
	await removeAttachmentFiles(supabase, await getAttachmentPathsForProject(supabase, projectId));
	await removeAttachmentFiles(supabase, await getProjectImagePaths(supabase, projectId));
	const { error } = await supabase.from('projects').delete().eq('id', projectId);
	if (error) throw error;
	if (project === null) return;
	await compactProjectBoard(supabase, project.ownerId);
	await compactTaskQueue(supabase, project.ownerId);
}
