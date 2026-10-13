import { isProjectOfClient, projectsOfClient } from './clientScope';
import { portalProjectColumns, toPortalProject } from './portalProjectRecord';
import type { PortalProject } from '$lib/portal/portalProject';
import type { SupabaseClient } from '@supabase/supabase-js';

const priorityColumn = 'priority';

/**
 * The projects YBT runs for a contact's client, read on the contact's own
 * account: row-level security (migration 0096) is what lets a contact read
 * them at all, so before it runs the portal home stands with no projects.
 */
export async function getPortalProjects(
	supabase: SupabaseClient,
	clientId: string
): Promise<PortalProject[]> {
	const { data, error } = await supabase
		.from('projects')
		.select(portalProjectColumns)
		.eq('client_id', clientId)
		.order('name')
		.order(priorityColumn, { referencedTable: 'goals' })
		.order(priorityColumn, { referencedTable: 'tasks' });
	if (error) throw error;
	return projectsOfClient(data.map(toPortalProject), clientId);
}

export async function getPortalProject(
	supabase: SupabaseClient,
	projectId: string,
	clientId: string
): Promise<PortalProject | null> {
	const { data, error } = await supabase
		.from('projects')
		.select(portalProjectColumns)
		.eq('id', projectId)
		.order(priorityColumn, { referencedTable: 'goals' })
		.order(priorityColumn, { referencedTable: 'tasks' })
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	const project = toPortalProject(data);
	if (!isProjectOfClient(project, clientId)) return null;
	return project;
}
