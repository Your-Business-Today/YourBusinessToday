import { redirect } from '@sveltejs/kit';
import { handOffToOtherDoor } from '$lib/server/auth/handOffToOtherDoor';
import { onboardingStartPath } from '$lib/onboarding/onboarding';
import { portalConnectPath } from '$lib/portal/siteDoors';
import { portalOrganisationParameter } from '$lib/portal/portalVisitor';
import type { SignUpAccount } from './addSignUpLead';

const seeOther = 303;
const signInThenStart = `/account/sign-in?next=${encodeURIComponent(onboardingStartPath)}`;

/** The signed-in account signing up; anyone not signed in signs in or creates an account first, then comes back. */
export async function requireSignUpAccount(locals: App.Locals): Promise<SignUpAccount> {
	const { user } = await locals.safeGetSession();
	if (user === null) redirect(seeOther, signInThenStart);
	return { accountId: user.id, emailAddress: user.email ?? '' };
}

/** Carries the person to the portal's Connect your Claude page, working in the business they signed up. */
export function connectAtPortal(
	locals: App.Locals,
	account: SignUpAccount,
	clientId: string
): Promise<string> {
	const destination = `${portalConnectPath}?${portalOrganisationParameter}=${clientId}`;
	return handOffToOtherDoor(locals, account.emailAddress, destination);
}
