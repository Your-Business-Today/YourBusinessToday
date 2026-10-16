import { connectorAddressFor } from '$lib/server/oauth/connectorAddress';
import { isOnboarding } from '$lib/server/onboarding/isOnboarding';
import { requirePortalVisitor } from '$lib/server/portal/requirePortalVisitor';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const visitor = await requirePortalVisitor(locals);
	return {
		visitor,
		connectorAddress: connectorAddressFor(locals.door, url),
		isOnboarding: await isOnboarding(locals.supabase, visitor.clientId)
	};
};
