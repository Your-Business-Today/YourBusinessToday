import { redirect } from '@sveltejs/kit';
import { getPortalProjects } from '$lib/server/portal/getPortalProjects';
import { requirePortalVisitor } from '$lib/server/portal/requirePortalVisitor';
import type { Actions, PageServerLoad } from './$types';

const signInPath = '/account/sign-in';

export const load: PageServerLoad = async ({ locals }) => {
	const visitor = await requirePortalVisitor(locals);
	const projects = await getPortalProjects(locals.supabase, visitor.clientId);
	return { visitor, projects };
};

export const actions: Actions = {
	signOut: async ({ locals }) => {
		const { auth } = locals.supabase;
		await auth.signOut();
		redirect(303, signInPath);
	}
};
