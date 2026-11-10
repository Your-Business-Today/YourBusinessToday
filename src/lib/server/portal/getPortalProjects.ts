import { isProjectOfClient, projectsOfClient } from './clientScope';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { PortalSurfaceColumns, PortalSurfaces } from './portalSurfaces';
import { toPortalProject } from './portalProjectRecord';
import { withProjectWork } from './portalProjectWork';
import type { PortalProject } from '$lib/portal/portalProject';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * The projects YBT runs for a contact's client, read on the contact's own
 * account through the portal surfaces of migration 0100; before it runs the
 * portal home stands with no projects.
 */
export async function getPortalProjects(
	supabase: SupabaseClient,
	clientId: string
): Promise<PortalProject[]> {
	const { data, error } = await supabase
		.from(PortalSurfaces.projects)
		.select(PortalSurfaceColumns.projects)
		.eq('client_id', clientId)
		.order('name');
	if (isSchemaNotYetMigrated(error)) return [];
	if (error) throw error;
	const projectRows = await withProjectWork(supabase, data);
	return projectsOfClient(projectRows.map(toPortalProject), clientId);
}

/** One project YBT runs for any of the contact's clients, or null when it is none of theirs. */
export async function getPortalProject(
	supabase: SupabaseClient,
	projectId: string,
	clientIds: string[]
): Promise<PortalProject | null> {
	const { data, error } = await supabase
		.from(PortalSurfaces.projects)
		.select(PortalSurfaceColumns.projects)
		.eq('id', projectId)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	const [projectRow] = await withProjectWork(supabase, [data]);
	const project = toPortalProject(projectRow);
	const isOfTheirClients = clientIds.some((clientId) => isProjectOfClient(project, clientId));
	return isOfTheirClients ? project : null;
}
