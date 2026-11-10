import { getProjectsForOrganisation } from '$lib/server/organisations/getProjectsForOrganisation';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { PortalSurfaces } from '$lib/server/portal/portalSurfaces';
import type { FramePickOption } from '$lib/components/frame/framePicks';
import type { PickOrganisation } from './pickOrganisations';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The projects of the picked organisation: its own, or the ones YBT runs for the client at the portal. */
export async function readPickProjects(
	supabase: SupabaseClient,
	organisation: PickOrganisation
): Promise<FramePickOption[]> {
	const { organisationId, portalClientId } = organisation;
	if (portalClientId !== null) return readPortalProjects(supabase, portalClientId);
	if (organisationId === null) return [];
	const projects = await getProjectsForOrganisation(supabase, organisationId);
	return projects.map(({ id, name }) => ({ id, name }));
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
