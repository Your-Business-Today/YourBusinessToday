import { longestPremisesAddress, longestPremisesName, longestPremisesType, longestRatingValue } from '$lib/data/foodHygieneRules';
import type { Establishment } from './establishmentRecord';

/** Why the establishment cannot be a premises row as it stands, or null when every value fits its column. */
export function validateEstablishment(establishment: Establishment): string | null {
	const { fhrsId, businessName, businessType, address, ratingValue } = establishment;
	if (businessName.length > longestPremisesName) return `${fhrsId}: the name is over ${longestPremisesName} characters.`;
	if (businessType.length > longestPremisesType) return `${fhrsId}: the type is over ${longestPremisesType} characters.`;
	if (address.length > longestPremisesAddress) return `${fhrsId}: the address is over ${longestPremisesAddress} characters.`;
	if (ratingValue.length > longestRatingValue) return `${fhrsId}: the rating is over ${longestRatingValue} characters.`;
	return null;
}
