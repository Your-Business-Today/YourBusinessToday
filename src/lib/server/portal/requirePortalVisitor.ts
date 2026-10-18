import { error, redirect } from '@sveltejs/kit';
import { getPortalVisitor } from './getPortalVisitor';
import { portalSignInPath } from '$lib/portal/portalPaths';
import type { PortalVisitor } from '$lib/portal/portalVisitor';

const seeOther = 303;
const staffHomePath = '/';
const forbidden = 403;

/** The signed-in client contact; anyone signed in who is not one is sent to the staff site's home. */
export async function requirePortalVisitor(locals: App.Locals): Promise<PortalVisitor> {
	const { user } = await locals.safeGetSession();
	if (user === null) redirect(seeOther, portalSignInPath);
	const visitor = await getPortalVisitor(locals.supabase, user.id, locals.portalOrganisationId);
	if (visitor === null) redirect(seeOther, staffHomePath);
	return visitor;
}

/** The signed-in client contact, provided they are an administrator of their organisation's portal. */
export async function requirePortalAdministrator(locals: App.Locals): Promise<PortalVisitor> {
	const visitor = await requirePortalVisitor(locals);
	if (!visitor.isAdministrator)
		error(forbidden, 'Only your organisation’s administrators can change its people.');
	return visitor;
}
