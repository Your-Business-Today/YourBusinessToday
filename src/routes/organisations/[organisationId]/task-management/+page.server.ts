import { loadTeamWork } from '$lib/server/organisations/loadTeamWork';
import { requireOrganisationAccess } from '$lib/server/auth/requireOrganisationAccess';
import { teamWorkActions } from './teamWorkActions';
import type { PageServerLoad } from './$types';
import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';
import type { TeamPerson } from '$lib/data/teamPeople';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { user, organisation } = await requireOrganisationAccess(locals, params.organisationId);
	const { groups, peopleByProduct } = await loadTeamWork(locals.supabase, user.id, organisation.id);
	return { organisation, groups, peopleByProduct: namesOnly(peopleByProduct), viewerId: user.id };
};

export const actions = teamWorkActions;

function namesOnly(peopleByProduct: Record<string, ProjectPerson[]>): Record<string, TeamPerson[]> {
	const entries = Object.entries(peopleByProduct).map(([productId, people]) => [productId, people.map(({ id, name }) => ({ id, name }))]);
	return Object.fromEntries(entries);
}
