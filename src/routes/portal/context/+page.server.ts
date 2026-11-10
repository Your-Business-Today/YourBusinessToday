import { readCompanyContextOfClient } from '$lib/server/companyContext/readCompanyContextOfClient';
import { requireLinkedPortalVisitor } from '$lib/server/portal/requireLinkedPortalVisitor';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (page) => {
	const visitor = await requireLinkedPortalVisitor(page);
	const context = await readCompanyContextOfClient(visitor.clientId);
	return { visitor, context };
};
