import { requireOrganisationModule } from '$lib/server/auth/requireOrganisationModule';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, params }) => {
	const { organisation, canManage } = await requireOrganisationModule(locals, params.organisationId, 'business_brain');
	return { organisation, canManage };
};
