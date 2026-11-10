import {
	isAmongOrganisations,
	portalOrganisationCookie,
	type PortalVisitor
} from '$lib/portal/portalVisitor';
import type { Refusal } from './portalFormReading';
import type { Cookies } from '@sveltejs/kit';

const yearInSeconds = 60 * 60 * 24 * 365;
const notYourOrganisation: Refusal = { refusal: 'Choose one of your organisations from the list.' };

/** Remembers the organisation the person works in, provided they are a contact there. */
export function switchPortalOrganisation(
	visitor: PortalVisitor,
	clientId: string,
	cookies: Cookies
): Refusal | null {
	if (!isAmongOrganisations(visitor, clientId)) return notYourOrganisation;
	cookies.set(portalOrganisationCookie, clientId, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		maxAge: yearInSeconds
	});
	return null;
}
