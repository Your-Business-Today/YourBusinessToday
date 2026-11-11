import { error } from '@sveltejs/kit';
import { getMembershipsForAccount } from '$lib/server/organisations/getMembershipsOfOrganisations';
import { getOrganisation } from '$lib/server/organisations/getOrganisation';
import { getProfileFlags } from './getProfileFlags';
import { managesOrganisation, type OrganisationVisitor } from '$lib/data/organisationAccess';
import { requireUser } from './requireUser';
import type { Organisation } from '$lib/server/organisations/organisationRecord';
import type { User } from '@supabase/supabase-js';

export type OrganisationAccess = {
	user: User;
	organisation: Organisation;
	isStaff: boolean;
	canManage: boolean;
	visitor: OrganisationVisitor;
};

/** Row level security hides an organisation from anyone not on it, so a missing row is a 404. */
export async function requireOrganisationAccess(
	locals: App.Locals,
	organisationId: string
): Promise<OrganisationAccess> {
	const access = await readOrganisationAccess(locals, organisationId);
	if (access === null) error(404, 'Organisation not found');
	return access;
}

/** The signed-in person's access to the organisation, or null when row level security hides it from them. */
export async function readOrganisationAccess(locals: App.Locals, organisationId: string): Promise<OrganisationAccess | null> {
	const user = await requireUser(locals);
	const organisation = await getOrganisation(locals.supabase, organisationId);
	if (organisation === null) return null;
	const isStaff = await isStaffMember(locals);
	const memberships = await getMembershipsForAccount(locals.supabase, user.id);
	const manages = managesOrganisation(memberships, user.id, organisation.id);
	const visitor = { accountId: user.id, isStaff, organisationMemberships: memberships };
	return { user, organisation, isStaff, canManage: isStaff || manages, visitor };
}

export async function isStaffMember(locals: App.Locals): Promise<boolean> {
	const profileFlags = await getProfileFlags(locals.supabase);
	return (profileFlags.isStaff || profileFlags.isAdmin) && !profileFlags.isRestricted;
}
