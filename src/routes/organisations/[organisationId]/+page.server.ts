import { organisationDetailsActions } from './organisationDetailsActions';
import { getMembersOfOrganisation } from '$lib/server/organisations/getMembersOfOrganisation';
import { getProjectsForOrganisation } from '$lib/server/organisations/getProjectsForOrganisation';
import { getSwitchedOnModules } from '$lib/server/organisations/getSwitchedOnModules';
import { getDirectorsOfOrganisation } from '$lib/server/boardroom/getDirectorsOfOrganisation';
import { sittingDirectors } from '$lib/data/boardroomDirector';
import { organisationDirectorActions } from './organisationDirectorActions';
import { getProjectsInViewerOrder } from '$lib/server/organisations/getProjectsInViewerOrder';
import { organisationMemberActions } from './organisationMemberActions';
import { organisationModuleActions } from './organisationModuleActions';
import { requireOrganisationAccess } from '$lib/server/auth/requireOrganisationAccess';
import { usableModules } from '$lib/data/organisationModuleAccess';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { user, organisation, canManage, isStaff, visitor } = await requireOrganisationAccess(locals, params.organisationId);
	const [members, projects, switchedOn, directors] = await Promise.all([
		getMembersOfOrganisation(locals.supabase, organisation.id),
		getProjectsForOrganisation(locals.supabase, organisation.id),
		getSwitchedOnModules(locals.supabase, organisation.id),
		getDirectorsOfOrganisation(locals.supabase, organisation.id)
	]);
	const modules = usableModules(visitor, { organisation, switchedOn });
	return {
		organisation,
		members,
		projects: await getProjectsInViewerOrder(locals.supabase, user.id, projects),
		modules,
		directors: modules.includes('boardroom') ? sittingDirectors(directors) : [],
		canManage,
		isStaff
	};
};

export const actions = {
	...organisationDetailsActions,
	...organisationMemberActions,
	...organisationModuleActions,
	...organisationDirectorActions
} satisfies Actions;
