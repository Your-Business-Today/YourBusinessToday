import type { SupabaseClient } from '@supabase/supabase-js';

/** Makes a project a team project or personal again; the database brings every staff member on or takes them off. */
export async function setTeamProject(
	supabase: SupabaseClient,
	projectId: string,
	isTeamProject: boolean
): Promise<void> {
	const { error } = await supabase
		.from('projects')
		.update({ is_team_project: isTeamProject })
		.eq('id', projectId);
	if (error) throw error;
}
