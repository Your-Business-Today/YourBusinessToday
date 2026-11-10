import { mintSignInLink } from '$lib/server/accounts/mintSignInLink';
import { setPasswordPath } from '$lib/server/accounts/mintRecoveryLink';
import { nextDestinationField } from '$lib/server/auth/setPasswordDestination';
import { portalConnectPath } from '$lib/portal/portalPaths';
import { portalOrganisationParameter } from '$lib/portal/portalVisitor';
import type { ClientContact } from '$lib/server/clients/clientContactRecord';

/** The sign-in a person set up arrives by, and the one link in their email. */
export type SetUpArrival = { accountId: string; openUrl: string; isNewAccount: boolean };

const signInPath = '/account/sign-in';

/** The portal's Connect your Claude page, working in the client's company. */
export function connectPathFor(clientId: string): string {
	return `${portalConnectPath}?${portalOrganisationParameter}=${clientId}`;
}

/**
 * A newcomer's link signs them in, has them choose a password and lands them on their company's Connect
 * your Claude page; someone who already has a sign-in is taken to sign in and then to the same page.
 */
export async function arrivalFor(
	contact: ClientContact,
	origin: string
): Promise<SetUpArrival> {
	const landing = `?${nextDestinationField}=${encodeURIComponent(connectPathFor(contact.clientId))}`;
	if (contact.accountId !== null)
		return { accountId: contact.accountId, openUrl: `${origin}${signInPath}${landing}`, isNewAccount: false };
	const signInLink = await mintSignInLink(contact.email, origin, `${setPasswordPath}${landing}`);
	return { accountId: signInLink.accountId, openUrl: signInLink.actionLink, isNewAccount: true };
}
