import { organisationDetailsActions } from './organisationDetailsActions';
import { getOrganisation } from '$lib/server/organisations/getOrganisation';
import { getOrganisationFamily } from '$lib/server/organisations/getOrganisationFamily';
import { getMembersOfOrganisation } from '$lib/server/organisations/getMembersOfOrganisation';
import { getProjectsForOrganisation } from '$lib/server/organisations/getProjectsForOrganisation';
import { getSwitchedOnModules } from '$lib/server/organisations/getSwitchedOnModules';
import { markReachableProjects } from '$lib/server/organisations/markReachableProjects';
import { organisationMemberActions } from './organisationMemberActions';
import { organisationModuleActions } from './organisationModuleActions';
import { requireOrganisationAccess } from '$lib/server/auth/requireOrganisationAccess';
import { subOrganisationActions } from './subOrganisationActions';
import { usableModules } from '$lib/data/organisationModuleAccess';
import type { Actions, PageServerLoad } from './$types';
import type { Organisation } from '$lib/server/organisations/organisationRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { user, organisation, canManage, isStaff, visitor } = await requireOrganisationAccess(locals, params.organisationId);
	const [parent, family, members, projects, switchedOn] = await Promise.all([
		parentOf(locals.supabase, organisation),
		getOrganisationFamily(locals.supabase, organisation.id),
		getMembersOfOrganisation(locals.supabase, organisation.id),
		getProjectsForOrganisation(locals.supabase, organisation.id),
		getSwitchedOnModules(locals.supabase, organisation.id)
	]);
	return {
		organisation,
		parent,
		children: family.filter((candidate) => candidate.parentOrganisationId === organisation.id),
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
	...organisationModuleActions,
	...subOrganisationActions
} satisfies Actions;

function parentOf(supabase: SupabaseClient, organisation: Organisation): Promise<Organisation | null> {
	if (organisation.parentOrganisationId === null) return Promise.resolve(null);
	return getOrganisation(supabase, organisation.parentOrganisationId);
}
