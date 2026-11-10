import { readBrandKitPage } from '$lib/server/brandKits/readBrandKitPage';
import { readPiecesAwaitingApproval } from '$lib/server/brandContent/readPiecesAwaitingApproval';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, parent }) => {
	await parent();
	const [kit, awaitingApproval] = await Promise.all([
		readBrandKitPage(locals.supabase, params.organisationId),
		readPiecesAwaitingApproval(locals.supabase, params.organisationId)
	]);
	return { kit, awaitingApproval };
};
