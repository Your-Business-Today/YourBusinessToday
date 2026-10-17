import { isUuid } from '$lib/data/isUuid';
import {
	isAmongOrganisations,
	portalOrganisationCookie,
	type PortalVisitor
} from '$lib/portal/portalVisitor';
import { textOf, type Refusal } from './portalFormReading';
import type { Cookies } from '@sveltejs/kit';

const yearInSeconds = 60 * 60 * 24 * 365;
const notYourOrganisation: Refusal = { refusal: 'Choose one of your organisations from the list.' };

/** The organisation a person chose to work in, or why the choice cannot be read. */
export function validatePortalOrganisationChoice(
	formData: FormData
): { clientId: string } | Refusal {
	const clientId = textOf(formData, 'clientId');
	if (!isUuid(clientId)) return notYourOrganisation;
	return { clientId };
}

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
