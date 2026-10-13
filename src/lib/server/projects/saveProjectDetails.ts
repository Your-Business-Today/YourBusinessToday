import { changeProjectOrganisation } from '$lib/server/organisations/changeProjectOrganisation';
import { isStaffMember } from '$lib/server/auth/requireOrganisationAccess';
import { changeTeamProject } from './changeTeamProject';
import { updateProjectDetails, type ProjectDetailsUpdate } from './updateProjectDetails';
import type { Project } from './projectRecord';

/** Saves the project edit form: its details, then its organisation and whether it is a team project; answers why not when one cannot change. */
export async function saveProjectDetails(
	locals: App.Locals,
	project: Project,
	edit: ProjectDetailsUpdate,
	formData: FormData
): Promise<string | null> {
	await updateProjectDetails(locals.supabase, project.id, edit);
	const organisationRefusal = await changeProjectOrganisation(locals.supabase, project, formData);
	if (organisationRefusal !== null) return organisationRefusal;
	return changeTeamProject(locals.supabase, project, formData, await isStaffMember(locals));
}
