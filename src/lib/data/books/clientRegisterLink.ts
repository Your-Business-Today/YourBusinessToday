import { companyDetails } from '../companyDetails';

/** Who is linking a customer, in whose books: the clients register is Your Business Today's, so only its staff link to it, in its own books. */
export type ClientLinkPlace = { isStaff: boolean; organisationName: string };

const leaveTheLinkOut = 'leave clientId out.';

/** Why a customer in these books cannot point at a client on the register, or null when it can. */
export function clientLinkPlaceRefusal(place: ClientLinkPlace): string | null {
	if (!place.isStaff) return `Only ${companyDetails.tradingName}'s staff link a customer to the clients register; ${leaveTheLinkOut}`;
	const isOwnBooks = place.organisationName === companyDetails.tradingName;
	if (isOwnBooks) return null;
	return (
		`Only ${companyDetails.tradingName}'s own books link a customer to the clients register, and these are ` +
		`${place.organisationName}'s; ${leaveTheLinkOut}`
	);
}
