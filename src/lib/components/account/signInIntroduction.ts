import { isAtPortalAddress } from '$lib/portal/portalAddress';
import { isPortalPage } from '$lib/portal/portalPaths';

const staffIntroduction =
	'New here? Create an account with your email address, or continue with Google.';
const clientPortalIntroduction =
	'Your client portal at Your Business Today. Use the email address your invitation went to.';
const portalAddressIntroduction =
	'The Your Business Today portal, for our team and our clients. Use the email address your invitation went to, or continue with Google.';

/** The line under the sign-in heading: everyone at the portal address, a client on the way to the portal, otherwise staff. */
export function signInIntroductionFor(url: URL): string {
	if (isAtPortalAddress(url)) return portalAddressIntroduction;
	if (isPortalPage(url)) return clientPortalIntroduction;
	return staffIntroduction;
}
