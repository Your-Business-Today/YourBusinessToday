import { requireOrganisationModule } from '$lib/server/auth/requireOrganisationModule';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, params }) => {
	const { organisation, isStaff } = await requireOrganisationModule(locals, params.organisationId, 'news');
	return { newsOrganisation: { id: organisation.id, name: organisation.name }, canKeepWatchList: isStaff };
};
