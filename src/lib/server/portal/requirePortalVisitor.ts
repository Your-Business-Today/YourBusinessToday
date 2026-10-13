import { redirect } from '@sveltejs/kit';
import { getPortalVisitor } from './getPortalVisitor';
import { requireUser } from '$lib/server/auth/requireUser';
import type { PortalVisitor } from '$lib/portal/portalVisitor';

const seeOther = 303;

/** The signed-in client contact; anyone signed in who is not one is sent to yourbusiness.today. */
export async function requirePortalVisitor(locals: App.Locals): Promise<PortalVisitor> {
	const user = await requireUser(locals);
	const visitor = await getPortalVisitor(locals.supabase, user.id);
	const { door } = locals;
	if (visitor === null) redirect(seeOther, door.otherDoorOrigin);
	return visitor;
}
