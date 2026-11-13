import type { SupabaseClient } from '@supabase/supabase-js';
import { compactProjectBoard, compactTaskQueue } from '$lib/server/ordering/compactInDatabase';
import { getProject } from '$lib/server/projects/getProject';
import { getAttachmentPathsForProject, removeAttachmentFiles } from './attachmentFiles';

/** Deletes the project, then its tasks' files, so a refused delete leaves every file where it was. */
export async function deleteProject(supabase: SupabaseClient, projectId: string): Promise<void> {
	const project = await getProject(supabase, projectId);
	const attachmentPaths = await getAttachmentPathsForProject(supabase, projectId);
	const { error } = await supabase.from('projects').delete().eq('id', projectId);
	if (error) throw error;
	await removeAttachmentFiles(supabase, attachmentPaths);
	if (project === null) return;
	await compactProjectBoard(supabase, project.ownerId);
	await compactTaskQueue(supabase, project.ownerId);
}
