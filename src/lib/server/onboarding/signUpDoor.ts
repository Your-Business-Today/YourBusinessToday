import { redirect } from '@sveltejs/kit';
import { getContactForAccount } from '$lib/server/clients/getContactsForClient';
import { handOffToOtherDoor } from '$lib/server/auth/handOffToOtherDoor';
import { onboardingStartPath } from '$lib/onboarding/onboarding';
import { portalConnectPath } from '$lib/portal/siteDoors';
import type { SignUpAccount } from './addSignUpLead';

const seeOther = 303;
const signInThenStart = `/account/sign-in?next=${encodeURIComponent(onboardingStartPath)}`;

/** The signed-in account signing up; anyone not signed in signs in or creates an account first, then comes back. */
export async function requireSignUpAccount(locals: App.Locals): Promise<SignUpAccount> {
	const { user } = await locals.safeGetSession();
	if (user === null) redirect(seeOther, signInThenStart);
	return { accountId: user.id, emailAddress: user.email ?? '' };
}

/** Someone already a client contact has begun, so they go straight on to connecting their Claude at the portal. */
export async function sendClientContactsToPortal(
	locals: App.Locals,
	account: SignUpAccount
): Promise<void> {
	const contact = await getContactForAccount(locals.supabase, account.accountId);
	if (contact === null) return;
	redirect(seeOther, await connectAtPortal(locals, account));
}

export function connectAtPortal(locals: App.Locals, account: SignUpAccount): Promise<string> {
	return handOffToOtherDoor(locals, account.emailAddress, portalConnectPath);
}
