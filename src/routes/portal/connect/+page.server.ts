import { connectorAddressFor } from '$lib/server/oauth/connectorAddress';
import { requireLinkedPortalVisitor } from '$lib/server/portal/requireLinkedPortalVisitor';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (page) => {
	const visitor = await requireLinkedPortalVisitor(page);
	return {
		visitor,
		connectorAddress: connectorAddressFor(page.url)
	};
};
