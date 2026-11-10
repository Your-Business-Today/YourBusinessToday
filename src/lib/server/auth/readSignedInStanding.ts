import { getDisplayName } from './getDisplayName';
import { getProfileFlags } from './getProfileFlags';
import { isPortalAccount } from './belongsAtPortal';
import { getPortalVisitor } from '$lib/server/portal/getPortalVisitor';
import { getUnreadNotificationCount } from '$lib/server/notifications/getUnreadNotificationCount';
import { isOnAnyOrganisation } from '$lib/server/organisations/isOnAnyOrganisation';
import type { User } from '@supabase/supabase-js';

/** Who is signed in and what the site's frame shows them, read once for every page. */
export type SignedInStanding = {
	userEmail: string | null;
	personName: string;
	isAdmin: boolean;
	isStaff: boolean;
	hasOrganisations: boolean;
	isPortalAccount: boolean;
	isPortalAdministrator: boolean;
	unreadNotificationCount: number;
};

export const signedOutStanding: SignedInStanding = {
	userEmail: null,
	personName: '',
	isAdmin: false,
	isStaff: false,
	hasOrganisations: false,
	isPortalAccount: false,
	isPortalAdministrator: false,
	unreadNotificationCount: 0
};

export async function readSignedInStanding(
	locals: App.Locals,
	user: User
): Promise<SignedInStanding> {
	const { supabase } = locals;
	const [profileFlags, hasOrganisations, unreadNotificationCount, displayName, portalVisitor] =
		await Promise.all([
			getProfileFlags(supabase),
			isOnAnyOrganisation(supabase, user.id),
			getUnreadNotificationCount(supabase, user.id),
			getDisplayName(supabase),
			getPortalVisitor(supabase, user.id, locals.portalOrganisationId)
		]);
	const userEmail = user.email ?? '';
	const isAtPortal = isPortalAccount(profileFlags, portalVisitor !== null);
	const portalName = isAtPortal ? (portalVisitor?.personName ?? '') : '';
	return {
		userEmail,
		personName: portalName || displayName || userEmail,
		isAdmin: profileFlags.isAdmin,
		isStaff: profileFlags.isStaff,
		hasOrganisations,
		isPortalAccount: isAtPortal,
		isPortalAdministrator: isAtPortal && portalVisitor?.isAdministrator === true,
		unreadNotificationCount
	};
}
