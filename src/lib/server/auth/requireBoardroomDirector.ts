import { error } from '@sveltejs/kit';
import { canEnterBoardroom } from '$lib/data/boardroomAccess';
import { getDirectorsOfOrganisation } from '$lib/server/boardroom/getDirectorsOfOrganisation';
import { getSwitchedOnModules } from '$lib/server/organisations/getSwitchedOnModules';
import { requireOrganisationModule } from './requireOrganisationModule';
import type { OrganisationAccess } from './requireOrganisationAccess';

export const onlyDirectorsEnter = 'Only a director of this organisation enters its boardroom';

/**
 * The gate every Boardroom page passes: the one module rule first, then the director check. Anyone
 * else — staff and people on the organisation above included — gets a 404, so nothing shows the room is there.
 */
export async function requireBoardroomDirector(locals: App.Locals, organisationId: string): Promise<OrganisationAccess> {
	const access = await requireOrganisationModule(locals, organisationId, 'boardroom');
	const [switchedOn, directors] = await Promise.all([
		getSwitchedOnModules(locals.supabase, organisationId),
		getDirectorsOfOrganisation(locals.supabase, organisationId)
	]);
	const boardroom = { organisation: access.organisation, switchedOn, directors };
	if (!canEnterBoardroom(access.visitor, boardroom)) error(404, onlyDirectorsEnter);
	return access;
}
