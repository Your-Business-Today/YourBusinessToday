import { changeProjectOrganisation } from '$lib/server/organisations/changeProjectOrganisation';
import { updateProjectDetails, type ProjectDetailsUpdate } from './updateProjectDetails';
import type { Project } from './projectRecord';

/** Saves the project edit form: its details, then then its organisation; answers why not when the organisation cannot change. */
export async function saveProjectDetails(
	locals: App.Locals,
	project: Project,
	edit: ProjectDetailsUpdate,
	formData: FormData
): Promise<string | null> {
	await updateProjectDetails(locals.supabase, project.id, edit);
	return changeProjectOrganisation(locals.supabase, project, formData);
}
