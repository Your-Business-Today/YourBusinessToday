import { error, redirect } from '@sveltejs/kit';
import { getPortalVisitor } from './getPortalVisitor';
import { requireUser } from '$lib/server/auth/requireUser';
import type { PortalVisitor } from '$lib/portal/portalVisitor';

const seeOther = 303;
const forbidden = 403;

/** The signed-in client contact; anyone signed in who is not one is sent to yourbusiness.today. */
export async function requirePortalVisitor(locals: App.Locals): Promise<PortalVisitor> {
	const user = await requireUser(locals);
	const visitor = await getPortalVisitor(locals.supabase, user.id, locals.portalOrganisationId);
	const { door } = locals;
	if (visitor === null) redirect(seeOther, door.otherDoorOrigin);
	return visitor;
}

/** The signed-in client contact, provided they are an administrator of their organisation's portal. */
export async function requirePortalAdministrator(locals: App.Locals): Promise<PortalVisitor> {
	const visitor = await requirePortalVisitor(locals);
	if (!visitor.isAdministrator)
		error(forbidden, 'Only your organisation’s administrators can change its people.');
	return visitor;
}
