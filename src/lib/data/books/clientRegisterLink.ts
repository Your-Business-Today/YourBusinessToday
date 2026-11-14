import { companyDetails } from '../companyDetails';

/** Who is linking a customer, in whose books: the clients register is Your Business Today's, so only its staff link to it, in its own books. */
export type ClientLinkPlace = { isStaff: boolean; organisationName: string };

/** What a customer of Your Business Today's own books may be linked to, and the field that links it. */
type OwnBooksLink = { linkedTo: string; field: string };

const clientRegisterLink: OwnBooksLink = { linkedTo: 'the clients register', field: 'clientId' };

const billedOrganisationLink: OwnBooksLink = { linkedTo: 'the client organisation it bills', field: 'billedOrganisationId' };

/** Why a customer in these books cannot point at a client on the register, or null when it can. */
export function clientLinkPlaceRefusal(place: ClientLinkPlace): string | null {
	return ownBooksLinkRefusal(place, clientRegisterLink);
}

/** Why a customer in these books cannot stand for a client organisation, or null when it can. */
export function billedOrganisationPlaceRefusal(place: ClientLinkPlace): string | null {
	return ownBooksLinkRefusal(place, billedOrganisationLink);
}

function ownBooksLinkRefusal(place: ClientLinkPlace, link: OwnBooksLink): string | null {
	const leaveTheLinkOut = `leave ${link.field} out.`;
	if (!place.isStaff) return `Only ${companyDetails.tradingName}'s staff link a customer to ${link.linkedTo}; ${leaveTheLinkOut}`;
	const isOwnBooks = place.organisationName === companyDetails.tradingName;
	if (isOwnBooks) return null;
	return (
		`Only ${companyDetails.tradingName}'s own books link a customer to ${link.linkedTo}, and these are ` +
		`${place.organisationName}'s; ${leaveTheLinkOut}`
	);
}
