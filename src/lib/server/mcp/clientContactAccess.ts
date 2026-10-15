import { getContactForAccount } from '$lib/server/clients/getContactsForClient';
import { getProject } from '$lib/server/projects/getProject';
import { isProjectOfClient } from '$lib/server/portal/clientScope';
import { validatePortalProjectId } from '$lib/server/portal/validatePortalRequest';
import type { ClientContact } from '$lib/server/clients/clientContactRecord';
import type { McpCaller } from './resolveMcpCaller';
import type { Project } from '$lib/server/projects/projectRecord';

export const notAClientContact =
	'These are for a client contact, and your account is not a contact at any organisation YBT works for.';
export const noProjectOfYourOrganisation =
	'No project YBT runs for your organisation has that id. Call list_portal_projects for them.';

/** The contact the caller is at the organisation YBT works for, or null for anyone else. */
export function clientContactOf(caller: McpCaller): Promise<ClientContact | null> {
	return getContactForAccount(caller.supabase, caller.accountId);
}

/** One of the projects YBT runs for the contact's organisation, the same reach the portal gives them. */
export async function projectOfYourOrganisation(
	caller: McpCaller,
	contact: ClientContact,
	projectId: string
): Promise<Project | null> {
	const validProjectId = validatePortalProjectId(projectId);
	if (validProjectId === null) return null;
	const project = await getProject(caller.supabase, validProjectId);
	if (project === null || !isProjectOfClient(project, contact.clientId)) return null;
	return project;
}
