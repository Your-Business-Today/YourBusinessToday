import { error } from '@sveltejs/kit';
import { canUseOrganisationModule } from '$lib/data/organisationModuleAccess';
import { getSwitchedOnModules } from '$lib/server/organisations/getSwitchedOnModules';
import { organisationModuleLabels, type OrganisationModule } from '$lib/data/organisationModules';
import { requireOrganisationAccess, type OrganisationAccess } from './requireOrganisationAccess';

/**
 * The gate every module page passes: the one rule, asked of the signed-in person. A module that
 * is off, or an organisation they do not reach, is a 404, so nothing shows that it is there.
 */
export async function requireOrganisationModule(
	locals: App.Locals,
	organisationId: string,
	module: OrganisationModule
): Promise<OrganisationAccess> {
	const access = await requireOrganisationAccess(locals, organisationId);
	const organisation = access.organisation;
	const switchedOn = await getSwitchedOnModules(locals.supabase, organisationId);
	const place = { organisation, switchedOn };
	if (!canUseOrganisationModule(access.visitor, place, module)) {
		error(404, `${organisationModuleLabels[module]} is not switched on for this organisation`);
	}
	return access;
}
