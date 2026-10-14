import { getPortalPeople } from '$lib/server/portal/getPortalPeople';
import { portalPeopleActions } from './portalPeopleActions';
import { requirePortalVisitor } from '$lib/server/portal/requirePortalVisitor';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const visitor = await requirePortalVisitor(locals);
	const people = await getPortalPeople(visitor.clientId);
	return { visitor, people };
};

export const actions: Actions = portalPeopleActions;
