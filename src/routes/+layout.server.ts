import { readSignedInStanding, signedOutStanding } from '$lib/server/auth/readSignedInStanding';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (user === null) return signedOutStanding;
	return readSignedInStanding(locals, user);
};
