import { getOrganisation } from '$lib/server/organisations/getOrganisation';
import { isOnOrganisation, managesOrganisation } from '$lib/data/organisationAccess';
import type { McpCaller } from './resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

export const noSuchOrganisation =
	'No organisation you are on has that id. Call list_organisations for the ones you are on.';
export const notAnOrganisationManager =
	'Only a project manager of that organisation, or of the organisation above it, or staff can do that.';

export function canReachOrganisation(caller: McpCaller, organisation: Organisation): boolean {
	if (caller.isStaff) return true;
	return isOnOrganisation(caller.organisationMemberships, [organisation], caller.accountId, organisation.id);
}

export function canManageOrganisation(caller: McpCaller, organisation: Organisation): boolean {
	if (caller.isStaff) return true;
	return managesOrganisation(caller.organisationMemberships, [organisation], caller.accountId, organisation.id);
}

export async function reachableOrganisation(
	caller: McpCaller,
	organisationId: string
): Promise<Organisation | null> {
	const organisation = await getOrganisation(caller.supabase, organisationId);
	if (organisation === null || !canReachOrganisation(caller, organisation)) return null;
	return organisation;
}

export async function manageableOrganisation(
	caller: McpCaller,
	organisationId: string
): Promise<Organisation | null> {
	const organisation = await reachableOrganisation(caller, organisationId);
	if (organisation === null || !canManageOrganisation(caller, organisation)) return null;
	return organisation;
}
