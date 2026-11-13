import { getMembershipsForAccount } from '$lib/server/organisations/getMembershipsOfOrganisations';
import { isStaffMember } from '$lib/server/auth/requireOrganisationAccess';
import { getSwitchedOnModules } from '$lib/server/organisations/getSwitchedOnModules';
import { usableModules } from '$lib/data/organisationModuleAccess';
import { enterableModules } from './enterableModules';
import { domainFrameLink, keepsTheDomain, moduleFrameLinks, workflowMapFrameLink } from '$lib/components/frame/moduleFolders';
import {
	organisationModuleRouteSegments,
	organisationModules,
	type OrganisationModule
} from '$lib/data/organisationModules';
import type { FrameLink } from '$lib/components/frame/frameGroups';
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

/**
 * The pages of the organisation's modules the person may use, by the one module rule, in the modules' order,
 * and the organisation's domain and workflow map, first in Knowledge, where they may enter the brain that keeps them.
 */
export async function readModuleLinks(
	locals: App.Locals,
	accountId: string,
	organisationId: string
): Promise<FrameLink[]> {
	if (modulesWithPages.length === 0) return [];
	const [visitor, switchedOn] = await Promise.all([
		readOrganisationVisitor(locals, accountId),
		getSwitchedOnModules(locals.supabase, organisationId)
	]);
	const place = { organisation: { id: organisationId }, switchedOn };
	const usable = usableModules(visitor, place).filter((module) => modulesWithPages.includes(module));
	const enterable = await enterableModules(locals, visitor, place, usable);
	const moduleLinks = enterable.flatMap((module) => moduleLinksFor(organisationId, module));
	if (!enterable.some(keepsTheDomain)) return moduleLinks;
	return [domainFrameLink(organisationId), workflowMapFrameLink(organisationId), ...moduleLinks];
}

function moduleLinksFor(organisationId: string, module: OrganisationModule): FrameLink[] {
	const segment = organisationModuleRouteSegments[module];
	return moduleFrameLinks(module, `/organisations/${organisationId}/${segment}`);
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
