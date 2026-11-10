import { requireOrganisationModule } from '$lib/server/auth/requireOrganisationModule';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, params }) => {
	const { organisation } = await requireOrganisationModule(locals, params.organisationId, 'brand');
	return { brandOrganisation: { id: organisation.id, name: organisation.name } };
};
