import type { SupabaseClient } from '@supabase/supabase-js';
import { compactProjectBoard, compactTaskQueue } from '$lib/server/ordering/compactInDatabase';
import { refusalToDeleteProject } from '$lib/data/projectDeletion';
import { getAttachmentPathsForProject, removeAttachmentFiles } from './attachmentFiles';
import { readProjectContents } from './readProjectContents';
import type { Project } from './projectRecord';

/**
 * Deletes a project created by mistake, with everything in it, and answers null; or answers why the project
 * stays, deleting nothing. A project that holds finished tasks is the record of that work and always stays.
 * The project goes before its tasks' files, so a refused delete leaves every file where it was.
 */
export async function deleteProject(supabase: SupabaseClient, project: Project): Promise<string | null> {
	const contents = await readProjectContents(supabase, project.id);
	const refusal = refusalToDeleteProject(project.name, contents);
	if (refusal !== null) return refusal;
	const attachmentPaths = await getAttachmentPathsForProject(supabase, project.id);
	const { error } = await supabase.from('projects').delete().eq('id', project.id);
	if (error) throw error;
	await removeAttachmentFiles(supabase, attachmentPaths);
	await compactProjectBoard(supabase, project.ownerId);
	await compactTaskQueue(supabase, project.ownerId);
	return null;
}
