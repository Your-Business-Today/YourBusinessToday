import { connectorAddressFor } from '$lib/server/oauth/connectorAddress';
import { isOnboarding } from '$lib/server/onboarding/isOnboarding';
import { portalOrganisationParameter } from '$lib/portal/portalVisitor';
import { requirePortalVisitor } from '$lib/server/portal/requirePortalVisitor';
import { switchPortalOrganisation } from '$lib/server/portal/switchPortalOrganisation';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url, cookies }) => {
	const linkedClientId = url.searchParams.get(portalOrganisationParameter);
	if (linkedClientId !== null) locals.portalOrganisationId = linkedClientId;
	const visitor = await requirePortalVisitor(locals);
	if (linkedClientId !== null) switchPortalOrganisation(visitor, linkedClientId, cookies);
	return {
		visitor,
		connectorAddress: connectorAddressFor(url),
		isOnboarding: await isOnboarding(locals.supabase, visitor.clientId)
	};
};
