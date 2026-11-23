import { requireOrganisationModule } from '$lib/server/auth/requireOrganisationModule';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, params }) => {
	const { organisation, user } = await requireOrganisationModule(locals, params.organisationId, 'chat');
	return {
		chatOrganisation: { id: organisation.id, name: organisation.name },
		chatAccountId: user.id
	};
};
