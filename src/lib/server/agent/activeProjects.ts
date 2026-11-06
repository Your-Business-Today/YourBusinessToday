import { parseProjectStatus, type ProjectStatus } from '$lib/data/projectStatus';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The statuses a project is worked in: being scoped or being built. Every other status waits. */
export const activeProjectStatuses: ProjectStatus[] = ['scoping', 'building'];

/**
 * The active projects a person is on, in their own order: the ones they own by their priority, then
 * the ones they are a member of by the rank they gave each. The agent works the first of these.
 */
export async function getActiveProjectIds(supabase: SupabaseClient, accountId: string): Promise<string[]> {
	const [owned, team] = await Promise.all([ownedProjects(supabase, accountId), teamProjects(supabase, accountId)]);
	return [...owned, ...team].filter((project) => isActive(project.status)).map((project) => project.id);
}

type RankedProject = { id: string; status: ProjectStatus };

async function ownedProjects(supabase: SupabaseClient, accountId: string): Promise<RankedProject[]> {
	const { data, error } = await supabase
		.from('projects')
		.select('id, status')
		.eq('owner_id', accountId)
		.order('priority', { ascending: true });
	if (error) throw error;
	return (data ?? []).map(readRankedProject);
}

async function teamProjects(supabase: SupabaseClient, accountId: string): Promise<RankedProject[]> {
	const { data, error } = await supabase.rpc('team_projects', { member: accountId });
	if (error) throw error;
	const rows = (data ?? []) as Record<string, unknown>[];
	return rows.map((row) => readRankedProject(row.project as Record<string, unknown>));
}

function readRankedProject(row: Record<string, unknown>): RankedProject {
	return { id: row.id as string, status: parseProjectStatus(row.status) };
}

function isActive(status: ProjectStatus): boolean {
	return activeProjectStatuses.includes(status);
}
