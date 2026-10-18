import { fail, redirect } from '@sveltejs/kit';
import { getPortalProjects } from '$lib/server/portal/getPortalProjects';
import { isRefusal } from '$lib/server/portal/portalFormReading';
import { portalHomePath, portalSignInPath } from '$lib/portal/portalPaths';
import { requirePortalVisitor } from '$lib/server/portal/requirePortalVisitor';
import {
	switchPortalOrganisation,
	validatePortalOrganisationChoice
} from '$lib/server/portal/switchPortalOrganisation';
import type { Actions, PageServerLoad } from './$types';

const badRequest = 400;
const seeOther = 303;

export const load: PageServerLoad = async ({ locals }) => {
	const visitor = await requirePortalVisitor(locals);
	const projects = await getPortalProjects(locals.supabase, visitor.clientId);
	return { visitor, projects };
};

export const actions: Actions = {
	signOut: async ({ locals }) => {
		const { auth } = locals.supabase;
		await auth.signOut();
		redirect(seeOther, portalSignInPath);
	},
	switchOrganisation: async ({ locals, request, cookies }) => {
		const visitor = await requirePortalVisitor(locals);
		const choice = validatePortalOrganisationChoice(await request.formData());
		if (isRefusal(choice)) return fail(badRequest, { message: choice.refusal });
		const refusal = switchPortalOrganisation(visitor, choice.clientId, cookies);
		if (refusal !== null) return fail(badRequest, { message: refusal.refusal });
		redirect(seeOther, portalHomePath);
	}
};
