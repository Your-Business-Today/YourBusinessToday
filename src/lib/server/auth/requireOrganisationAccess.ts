import { error } from '@sveltejs/kit';
import { getMembershipsForAccount } from '$lib/server/organisations/getMembershipsOfOrganisations';
import { getOrganisation } from '$lib/server/organisations/getOrganisation';
import { getProfileFlags } from './getProfileFlags';
import { managesOrganisation } from '$lib/data/organisationAccess';
import { requireUser } from './requireUser';
import type { Organisation } from '$lib/server/organisations/organisationRecord';
import type { User } from '@supabase/supabase-js';

export type OrganisationAccess = {
	user: User;
	organisation: Organisation;
	isStaff: boolean;
	canManage: boolean;
};

/** Row level security hides an organisation from anyone not on it, so a missing row is a 404. */
export async function requireOrganisationAccess(
	locals: App.Locals,
	organisationId: string
): Promise<OrganisationAccess> {
	const user = await requireUser(locals);
	const organisation = await getOrganisation(locals.supabase, organisationId);
	if (organisation === null) error(404, 'Organisation not found');
	const isStaff = await isStaffMember(locals);
	const memberships = await getMembershipsForAccount(locals.supabase, user.id);
	const manages = managesOrganisation(memberships, [organisation], user.id, organisation.id);
	return { user, organisation, isStaff, canManage: isStaff || manages };
}

export async function isStaffMember(locals: App.Locals): Promise<boolean> {
	const profileFlags = await getProfileFlags(locals.supabase);
	return (profileFlags.isStaff || profileFlags.isAdmin) && !profileFlags.isRestricted;
}
