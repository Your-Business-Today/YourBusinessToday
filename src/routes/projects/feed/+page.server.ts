import { feedDependency } from '$lib/data/feedRefresh';
import { parseFeedScope } from '$lib/data/feedEvent';
import { getFeedForProjects } from '$lib/server/feed/getFeedForProjects';
import { getReachableProjectIds } from '$lib/server/feed/getReachableProjectIds';
import { requireUser } from '$lib/server/auth/requireUser';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url, depends }) => {
	depends(feedDependency);
	const user = await requireUser(locals);
	const scope = parseFeedScope(url.searchParams.get('scope'));
	const projectIds = await getReachableProjectIds(locals.supabase, user.id);
	const events = await getFeedForProjects(locals.supabase, { accountId: user.id, projectIds, scope });
	return { events, scope, viewerId: user.id, readAt: new Date().toISOString() };
};
