import { redirect } from '@sveltejs/kit';
import { isAdmitted } from './isAdmitted';
import {
	awaitingAccessPage,
	isOpenWhileAwaitingAccess,
} from './pathsOpenWhileAwaiting';

const seeOther = 303;

/** A signed-in account not yet let in reaches the contact page and nothing else: every other page and form sends it there. */
export async function sendAwaitingAccountsToContact(
	locals: App.Locals,
	url: URL,
): Promise<void> {
	const { user } = await locals.safeGetSession();
	if (user === null) return;
	const isLetIn = await isAdmitted(locals.supabase, {
		accountId: user.id,
		createdAt: user.created_at,
	});
	locals.isAwaitingAccess = !isLetIn;
	if (isLetIn || isOpenWhileAwaitingAccess(url.pathname)) return;
	redirect(seeOther, awaitingAccessPage);
}
