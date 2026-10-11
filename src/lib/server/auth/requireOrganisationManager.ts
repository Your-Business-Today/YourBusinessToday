import { error } from '@sveltejs/kit';
import { requireOrganisationAccess, type OrganisationAccess } from './requireOrganisationAccess';

export const onlyManagersMessage = 'Only a project manager of this organisation, or staff, can do that.';

export async function requireOrganisationManager(
	locals: App.Locals,
	organisationId: string
): Promise<OrganisationAccess> {
	const access = await requireOrganisationAccess(locals, organisationId);
	if (!access.canManage) error(403, onlyManagersMessage);
	return access;
}
