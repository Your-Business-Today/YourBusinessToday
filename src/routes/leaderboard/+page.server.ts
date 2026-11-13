import { loadSalesLeaderboard } from '$lib/server/salesLeaderboard/loadSalesLeaderboard';
import { requireStaff } from '$lib/server/auth/requireStaff';
import type { PageServerLoad } from './$types';

/** The picked organisation's leaderboard; with no organisation picked there are no registers to count. */
export const load: PageServerLoad = async ({ locals, parent }) => {
	await requireStaff(locals);
	const { framePicks } = await parent();
	const organisationId = framePicks?.pickedOrganisationId ?? null;
	if (organisationId === null) return { standings: [] };
	return { standings: await loadSalesLeaderboard(locals.supabase, organisationId) };
};
