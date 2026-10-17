import { getContactsForAccount } from '$lib/server/clients/getContactsForClient';
import { getProject } from '$lib/server/projects/getProject';
import { isProjectOfClient } from '$lib/server/portal/clientScope';
import { validatePortalProjectId } from '$lib/server/portal/validatePortalRequest';
import type { ClientContact } from '$lib/server/clients/clientContactRecord';
import type { McpCaller } from './resolveMcpCaller';
import type { Project } from '$lib/server/projects/projectRecord';

export const notAClientContact =
	'These are for a client contact, and your account is not a contact at any organisation YBT works for.';
export const noProjectOfYourOrganisation =
	'No project YBT runs for your organisations has that id. Call list_portal_projects for them.';

export type ContactProject = { project: Project; contact: ClientContact };

/** Every contact the caller is, one at each organisation YBT works for; none for anyone else. */
export function clientContactsOf(caller: McpCaller): Promise<ClientContact[]> {
	return getContactsForAccount(caller.supabase, caller.accountId);
}

/**
 * One of the projects YBT runs for an organisation the caller is a contact at, the same reach the
 * portal gives them, with the contact they are there.
 */
export async function projectOfYourOrganisation(
	caller: McpCaller,
	contacts: ClientContact[],
	projectId: string
): Promise<ContactProject | null> {
	const validProjectId = validatePortalProjectId(projectId);
	if (validProjectId === null) return null;
	const project = await getProject(caller.supabase, validProjectId);
	if (project === null) return null;
	const contact = contacts.find((candidate) => isProjectOfClient(project, candidate.clientId));
	if (contact === undefined) return null;
	return { project, contact };
}
