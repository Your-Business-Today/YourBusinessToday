import { organisationDetailsActions } from './organisationDetailsActions';
import { getMembersOfOrganisation } from '$lib/server/organisations/getMembersOfOrganisation';
import { getProjectsForOrganisation } from '$lib/server/organisations/getProjectsForOrganisation';
import { getSwitchedOnModules } from '$lib/server/organisations/getSwitchedOnModules';
import { markReachableProjects } from '$lib/server/organisations/markReachableProjects';
import { organisationMemberActions } from './organisationMemberActions';
import { organisationModuleActions } from './organisationModuleActions';
import { requireOrganisationAccess } from '$lib/server/auth/requireOrganisationAccess';
import { usableModules } from '$lib/data/organisationModuleAccess';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { user, organisation, canManage, isStaff, visitor } = await requireOrganisationAccess(locals, params.organisationId);
	const [members, projects, switchedOn] = await Promise.all([
		getMembersOfOrganisation(locals.supabase, organisation.id),
		getProjectsForOrganisation(locals.supabase, organisation.id),
		getSwitchedOnModules(locals.supabase, organisation.id)
	]);
	return {
		organisation,
		members,
		projects: await markReachableProjects(locals.supabase, user.id, projects),
		modules: usableModules(visitor, { organisation, switchedOn }),
		canManage,
		isStaff
	};
};

export const actions = {
	...organisationDetailsActions,
	...organisationMemberActions,
	...organisationModuleActions
} satisfies Actions;
