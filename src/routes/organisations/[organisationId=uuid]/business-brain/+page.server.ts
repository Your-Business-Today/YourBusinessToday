import { readBusinessBrainForPage } from '$lib/server/businessBrain/readBusinessBrainForPage';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, parent }) => {
	const { organisation, canManage } = await parent();
	return { brain: await readBusinessBrainForPage(locals.supabase, organisation.id, canManage) };
};
