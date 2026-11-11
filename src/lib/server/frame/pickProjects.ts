import { getProjectsForOrganisation } from '$lib/server/organisations/getProjectsForOrganisation';
import { markReachableProjects } from '$lib/server/organisations/markReachableProjects';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { PortalSurfaces } from '$lib/server/portal/portalSurfaces';
import { projectsTheyCanOpen } from './openableProjects';
import type { FramePickOption } from '$lib/components/frame/framePicks';
import type { PickOrganisation } from './pickOrganisations';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The projects of the picked organisation that open for the person: their own, or the ones YBT runs for the client at the portal. */
export async function readPickProjects(
	supabase: SupabaseClient,
	accountId: string,
	organisation: PickOrganisation
): Promise<FramePickOption[]> {
	const { organisationId, portalClientId } = organisation;
	if (portalClientId !== null) return readPortalProjects(supabase, portalClientId);
	if (organisationId === null) return [];
	const projects = await getProjectsForOrganisation(supabase, organisationId);
	const markedProjects = await markReachableProjects(supabase, accountId, projects);
	return projectsTheyCanOpen(markedProjects);
}

async function readPortalProjects(supabase: SupabaseClient, clientId: string): Promise<FramePickOption[]> {
	const { data, error } = await supabase
		.from(PortalSurfaces.projects)
		.select('id, name')
		.eq('client_id', clientId)
		.order('name');
	if (isSchemaNotYetMigrated(error)) return [];
	if (error) throw error;
	return data.map((row) => ({ id: row.id as string, name: row.name as string }));
}
