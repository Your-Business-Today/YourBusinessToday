import { requireOrganisationModule } from '$lib/server/auth/requireOrganisationModule';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, params }) => {
	const { organisation } = await requireOrganisationModule(locals, params.organisationId, 'books');
	return { booksOrganisation: { id: organisation.id, name: organisation.name } };
};
