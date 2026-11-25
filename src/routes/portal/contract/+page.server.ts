import { requireLinkedPortalVisitor } from '$lib/server/portal/requireLinkedPortalVisitor';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { findPortalContractPack } from '$lib/server/contractPacks/portalContractPack';
import { recordPackViewed } from '$lib/server/contractPacks/clientPackSteps';
import type { PageServerLoad } from './$types';

/** The contract pack Your Business Today sent the client the portal works in, each document with whether it is signed; opening it marks it viewed. */
export const load: PageServerLoad = async (page) => {
	const visitor = await requireLinkedPortalVisitor(page);
	const service = supabaseServiceClient();
	const pack = await findPortalContractPack(service, visitor.clientId);
	const { user } = await page.locals.safeGetSession();
	if (pack !== null) await recordPackViewed({ service, contactId: visitor.contactId, accountId: user?.id ?? '' }, pack);
	return { visitor, pack };
};
