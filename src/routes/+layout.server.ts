import { getProfileFlags } from '$lib/server/auth/getProfileFlags';
import { getUnreadNotificationCount } from '$lib/server/notifications/getUnreadNotificationCount';
import { isOnAnyOrganisation } from '$lib/server/organisations/isOnAnyOrganisation';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (user === null) {
		return { userEmail: null, isAdmin: false, isStaff: false, hasOrganisations: false, unreadNotificationCount: 0 };
	}
	const profileFlags = await getProfileFlags(locals.supabase);
	return {
		userEmail: user.email ?? '',
		isAdmin: profileFlags.isAdmin,
		isStaff: profileFlags.isStaff,
		hasOrganisations: await isOnAnyOrganisation(locals.supabase, user.id),
		unreadNotificationCount: await getUnreadNotificationCount(locals.supabase, user.id)
	};
};
