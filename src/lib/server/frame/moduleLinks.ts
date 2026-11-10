import { getMembershipsForAccount } from '$lib/server/organisations/getMembershipsOfOrganisations';
import { isStaffMember } from '$lib/server/auth/requireOrganisationAccess';
import { getSwitchedOnModules } from '$lib/server/organisations/getSwitchedOnModules';
import { usableModules } from '$lib/data/organisationModuleAccess';
import { enterableModules } from './enterableModules';
import {
	organisationModuleLabels,
	organisationModuleRouteSegments,
	organisationModules,
	type OrganisationModule
} from '$lib/data/organisationModules';
import type { NavigationLink } from '$lib/components/site/siteNavigation';
import type { OrganisationVisitor } from '$lib/data/organisationAccess';

const modulePageFiles = Object.keys(import.meta.glob('/src/routes/organisations/*/*/+page.svelte'));
const modulePageSegmentPattern = /\/organisations\/[^/]+\/([^/]+)\/\+page\.svelte$/;

/**
 * A module joins the side bar once its page is built: each module's page is its own task, and it
 * adds its route under /organisations/<id>/, never a line here, so no item leads nowhere.
 */
export const modulesWithPages: OrganisationModule[] = organisationModules.filter((module) =>
	modulePageFiles.some((file) => modulePageSegmentOf(file) === organisationModuleRouteSegments[module])
);

/** The pages of the organisation's modules the person may use, by the one module rule, in the modules' order. */
export async function readModuleLinks(
	locals: App.Locals,
	accountId: string,
	organisationId: string
): Promise<NavigationLink[]> {
	if (modulesWithPages.length === 0) return [];
	const [visitor, switchedOn] = await Promise.all([
		readOrganisationVisitor(locals, accountId),
		getSwitchedOnModules(locals.supabase, organisationId)
	]);
	const place = { organisation: { id: organisationId }, switchedOn };
	const usable = usableModules(visitor, place).filter((module) => modulesWithPages.includes(module));
	const enterable = await enterableModules(locals, visitor, place, usable);
	return enterable.map((module) => moduleLinkFor(organisationId, module));
}

function moduleLinkFor(organisationId: string, module: OrganisationModule): NavigationLink {
	const segment = organisationModuleRouteSegments[module];
	return { href: `/organisations/${organisationId}/${segment}`, label: organisationModuleLabels[module] };
}

async function readOrganisationVisitor(locals: App.Locals, accountId: string): Promise<OrganisationVisitor> {
	const [isStaff, organisationMemberships] = await Promise.all([
		isStaffMember(locals),
		getMembershipsForAccount(locals.supabase, accountId)
	]);
	return { accountId, isStaff, organisationMemberships };
}

function modulePageSegmentOf(file: string): string | null {
	const match = modulePageSegmentPattern.exec(file);
	return match?.[1] ?? null;
}
