import type { SupabaseClient } from '@supabase/supabase-js';
import { readTeamChoiceFrom, teamProjectsAreForStaff } from '$lib/data/teamProject';
import { setTeamProject } from './setTeamProject';
import type { Project } from './projectRecord';

/** Makes the project a team project, or personal again, when the edit form asks; answers why not when it cannot. */
export async function changeTeamProject(
	supabase: SupabaseClient,
	project: Project,
	formData: FormData,
	isStaff: boolean
): Promise<string | null> {
	const isTeamProject = readTeamChoiceFrom(formData);
	if (isTeamProject === null || isTeamProject === project.isTeamProject) return null;
	if (!isStaff) return teamProjectsAreForStaff;
	await setTeamProject(supabase, project.id, isTeamProject);
	return null;
}
