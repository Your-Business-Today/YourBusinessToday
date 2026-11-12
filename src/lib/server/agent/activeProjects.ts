import { asOneList } from '$lib/server/projects/asOneList';
import { getOwnedProjects } from '$lib/server/projects/getOwnedProjects';
import { parseProjectRecord, type Project } from '$lib/server/projects/projectRecord';
import type { ProjectStatus } from '$lib/data/projectStatus';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The statuses a project is worked in: being scoped or being built. Every other status waits. */
export const activeProjectStatuses: ProjectStatus[] = ['scoping', 'building'];

/**
 * The active projects a person is on, in the order of their one projects list: the ones they own
 * and the ones others own, as that person placed them. The agent works the first of these.
 */
export async function getActiveProjectIds(supabase: SupabaseClient, accountId: string): Promise<string[]> {
	const [ownProjects, teamProjects] = await Promise.all([
		getOwnedProjects(supabase, accountId),
		getTeamBoardProjects(supabase, accountId)
	]);
	return asOneList(ownProjects, teamProjects).filter(isActive).map((project) => project.id);
}

async function getTeamBoardProjects(supabase: SupabaseClient, accountId: string): Promise<Project[]> {
	const { data, error } = await supabase.rpc('team_projects', { member: accountId });
	if (error) throw error;
	const rows = (data ?? []) as Record<string, unknown>[];
	return rows.map((row) => parseProjectRecord(row.project as Record<string, unknown>));
}

function isActive(project: Project): boolean {
	return activeProjectStatuses.includes(project.status);
}
