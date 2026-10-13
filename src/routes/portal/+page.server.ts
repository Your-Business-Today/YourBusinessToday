import { redirect } from '@sveltejs/kit';
import { requireUser } from '$lib/server/auth/requireUser';
import { getPortalVisitor } from '$lib/server/portal/getPortalVisitor';
import type { Actions, PageServerLoad } from './$types';

const signInPath = '/account/sign-in';

export const load: PageServerLoad = async ({ locals }) => {
	const user = await requireUser(locals);
	const visitor = await getPortalVisitor(locals.supabase, user.id);
	const { door } = locals;
	if (visitor === null) redirect(303, door.otherDoorOrigin);
	return { visitor };
};

export const actions: Actions = {
	signOut: async ({ locals }) => {
		const { auth } = locals.supabase;
		await auth.signOut();
		redirect(303, signInPath);
	}
};
