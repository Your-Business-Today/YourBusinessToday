import { readFramePicks } from '$lib/server/frame/readFramePicks';
import { readSignedInStanding, signedOutStanding } from '$lib/server/auth/readSignedInStanding';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (user === null) return { ...signedOutStanding, framePicks: null };
	const [standing, framePickReading] = await Promise.all([
		readSignedInStanding(locals, user),
		readFramePicks(locals, user.id, locals.rememberedPicks)
	]);
	return { ...standing, framePicks: framePickReading.picks };
};
