import { organisationDetailsActions } from './organisationDetailsActions';
import { getMembersOfOrganisation } from '$lib/server/organisations/getMembersOfOrganisation';
import { getSwitchedOnModules } from '$lib/server/organisations/getSwitchedOnModules';
import { getDirectorsOfOrganisation } from '$lib/server/boardroom/getDirectorsOfOrganisation';
import { sittingDirectors } from '$lib/data/boardroomDirector';
import { organisationDirectorActions } from './organisationDirectorActions';
import { organisationMemberActions } from './organisationMemberActions';
import { organisationModuleActions } from './organisationModuleActions';
import { organisationBillingActions } from '$lib/server/books/organisationBilling/organisationBillingFormActions';
import { readOrganisationBilling } from '$lib/server/books/organisationBilling/readOrganisationBilling';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { requireOrganisationAccess } from '$lib/server/auth/requireOrganisationAccess';
import { usableModules } from '$lib/data/organisationModuleAccess';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { organisation, canManage, isStaff, visitor } = await requireOrganisationAccess(locals, params.organisationId);
	const [members, switchedOn, directors, billing] = await Promise.all([
		getMembersOfOrganisation(locals.supabase, organisation.id),
		getSwitchedOnModules(locals.supabase, organisation.id),
		getDirectorsOfOrganisation(locals.supabase, organisation.id),
		isStaff ? readOrganisationBilling(supabaseServiceClient(), organisation.id) : null
	]);
	const modules = usableModules(visitor, { organisation, switchedOn });
	return {
		organisation,
		members,
		modules,
		directors: modules.includes('boardroom') ? sittingDirectors(directors) : [],
		billing,
		canManage,
		isStaff
	};
};

export const actions = {
	...organisationDetailsActions,
	...organisationMemberActions,
	...organisationModuleActions,
	...organisationDirectorActions,
	...organisationBillingActions
} satisfies Actions;
