import { readLeadOfPage } from '$lib/server/clients/readLeadOfPage';
import { readDomainForPage } from '$lib/server/businessBrain/readDomainForPage';
import { requireOrganisationAccess } from '$lib/server/auth/requireOrganisationAccess';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { client, organisationId } = await readLeadOfPage(event.locals, event);
	if (organisationId === null) return { client, organisation: null, reading: null };
	const access = await requireOrganisationAccess(event.locals, organisationId);
	const { id, name } = access.organisation;
	return { client, organisation: { id, name }, reading: await readDomainForPage(event.locals, access, event.url) };
};
