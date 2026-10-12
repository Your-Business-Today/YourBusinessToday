import { areaFeedDependency } from '$lib/data/areaFeedRefresh';
import { areaFeedScopes } from '$lib/data/areaEvent';
import { getFeedForPatches } from '$lib/server/areaEvents/getFeedForPatches';
import { listPatches } from '$lib/server/patches/listPatches';
import { kindsInView, readAreaFeedView, type AreaFeedView } from '$lib/data/areaFeedChoices';
import { requireStaff } from '$lib/server/auth/requireStaff';
import type { Patch } from '$lib/server/patches/patchRecord';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url, depends }) => {
	depends(areaFeedDependency);
	const user = await requireStaff(locals);
	const view = readAreaFeedView(url.searchParams);
	const patches = await listPatches(locals.supabase);
	const inView = patchesInView(patches, view, user.id);
	const outcodes = inView.flatMap((patch) => patch.outcodes);
	const events = await getFeedForPatches(locals.supabase, { outcodes, kinds: kindsInView(view), since: view.since });
	return { events, view, patches: patches.map((patch) => ({ id: patch.id, name: patch.name })), readAt: new Date().toISOString() };
};

/** The patches the feed is read for: one chosen, the viewer's own, or every patch. */
function patchesInView(patches: Patch[], view: AreaFeedView, viewerId: string): Patch[] {
	if (view.patchId !== null) return patches.filter((patch) => patch.id === view.patchId);
	if (view.scope === areaFeedScopes.mine) return patches.filter((patch) => patch.ownerAccountId === viewerId);
	return patches;
}
