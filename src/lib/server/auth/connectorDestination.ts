import { onboardingStartPath } from '$lib/onboarding/onboarding';

const connectorAuthorizationPath = '/oauth/';

/**
 * Whether a sign-in is a step in connecting a Claude to YBT. The connection finishes at the
 * door it started from, so a client contact is not handed to the portal partway through it.
 */
export function isConnectorDestination(destination: string | null): destination is string {
	return destination !== null && destination.startsWith(connectorAuthorizationPath);
}

/** Signing a business up finishes at yourbusiness.today too, even for someone already on the portal. */
export function isSignUpDestination(destination: string | null): destination is string {
	return destination === onboardingStartPath;
}
