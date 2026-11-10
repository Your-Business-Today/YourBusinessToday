import { readCompanyContextOfClient } from '$lib/server/companyContext/readCompanyContextOfClient';
import { requireLinkedPortalVisitor } from '$lib/server/portal/requireLinkedPortalVisitor';
import { portalContextActions } from './portalContextActions';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (page) => {
	const visitor = await requireLinkedPortalVisitor(page);
	const reading = await readCompanyContextOfClient(visitor.clientId);
	return { visitor, reading };
};

export const actions: Actions = portalContextActions;
