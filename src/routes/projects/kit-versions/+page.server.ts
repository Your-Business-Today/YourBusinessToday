import { describeKitVersionsRead, readOwnedKitVersions } from '$lib/server/kit/readOwnedKitVersions';
import { getKitVersionRegister } from '$lib/server/kit/getKitVersionRegister';
import { getLatestKitVersion } from '$lib/server/kit/kitVersions';
import { requireUser } from '$lib/server/auth/requireUser';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = await requireUser(locals);
	const latestKitVersion = await getLatestKitVersion(locals.supabase);
	return { register: await getKitVersionRegister(locals.supabase, user.id, latestKitVersion) };
};

export const actions: Actions = {
	readKitVersions: async ({ locals }) => {
		const user = await requireUser(locals);
		const read = await readOwnedKitVersions(supabaseServiceClient(), user.id);
		return { message: describeKitVersionsRead(read) };
	}
};
