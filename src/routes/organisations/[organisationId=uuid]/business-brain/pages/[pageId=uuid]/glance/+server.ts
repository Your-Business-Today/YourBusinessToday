import { error, json } from '@sveltejs/kit';
import { readBusinessBrainPageGlance } from '$lib/server/businessBrain/readBusinessBrainPageGlance';
import { requireOrganisationModule } from '$lib/server/auth/requireOrganisationModule';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, params }) => {
	const { organisation } = await requireOrganisationModule(locals, params.organisationId, 'business_brain');
	const glance = await readBusinessBrainPageGlance(locals.supabase, { organisationId: organisation.id, pageId: params.pageId });
	if (glance === null) error(404, 'Page not found');
	return json(glance);
};
