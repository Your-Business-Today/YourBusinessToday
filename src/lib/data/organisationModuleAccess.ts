import { reachesOrganisation, type OrganisationPlace, type OrganisationVisitor } from './organisationAccess';
import type { OrganisationModule } from './organisationModules';

/** An organisation with the modules an administrator has switched on for it. */
export type ModuleOrganisation = { organisation: OrganisationPlace; switchedOn: OrganisationModule[] };

/**
 * The one rule every module page and connector action asks: the module is switched on for the
 * organisation, and the person reaches the organisation by the reach rule projects already use.
 * The database asks the same through can_use_organisation_module.
 */
export function canUseOrganisationModule(
	visitor: OrganisationVisitor,
	place: ModuleOrganisation,
	module: OrganisationModule
): boolean {
	if (!place.switchedOn.includes(module)) return false;
	return reachesOrganisation(visitor, place.organisation);
}

/** The modules a person sees for an organisation: the switched-on ones they may use. */
export function usableModules(visitor: OrganisationVisitor, place: ModuleOrganisation): OrganisationModule[] {
	return place.switchedOn.filter((module) => canUseOrganisationModule(visitor, place, module));
}
