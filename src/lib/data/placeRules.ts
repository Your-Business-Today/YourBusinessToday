/** What a trading place from Overture Maps Places must be before it is written. */
export type PlaceSeed = {
	sourceId: string;
	businessName: string;
	category: string;
	address: string;
	postcode: string;
	latitude: number;
	longitude: number;
	website: string;
	phone: string;
	confidence: number;
	sourceLicence: string;
};

/** A place the dataset is less sure of than this is not drawn: its coverage is uneven and its duplicates known. */
export const placeConfidenceFloor = 0.7;

export const longestPlaceName = 200;
export const longestPlaceCategory = 100;
export const longestPlaceAddress = 300;
export const longestPlaceWebsite = 300;
export const longestPlacePhone = 40;
export const longestPlaceLicence = 120;

/** The licences a row may carry and still be stored: permissive ones only, never share-alike. */
export const placeLicencesAccepted = ['CDLA-Permissive-2.0', 'Apache-2.0', 'CC0-1.0', 'CC0', ''];

export const placeLicenceRefused = 'is under a share-alike licence and is not stored.';

/** Why the place cannot be written as it stands, or null when every value fits its column and its licence allows it. */
export function validatePlace(seed: PlaceSeed): string | null {
	const { sourceId, businessName, category, address, website, phone, sourceLicence } = seed;
	if (sourceId === '' || businessName === '') return 'A place needs its id and name.';
	if (businessName.length > longestPlaceName) return `${sourceId}: the name is over ${longestPlaceName} characters.`;
	if (category.length > longestPlaceCategory) return `${sourceId}: the category is over ${longestPlaceCategory} characters.`;
	if (address.length > longestPlaceAddress) return `${sourceId}: the address is over ${longestPlaceAddress} characters.`;
	if (website.length > longestPlaceWebsite) return `${sourceId}: the website is over ${longestPlaceWebsite} characters.`;
	if (phone.length > longestPlacePhone) return `${sourceId}: the phone is over ${longestPlacePhone} characters.`;
	if (sourceLicence.length > longestPlaceLicence) return `${sourceId}: the licence name is over ${longestPlaceLicence} characters.`;
	if (seed.confidence < placeConfidenceFloor) return `${sourceId}: confidence ${seed.confidence} is below ${placeConfidenceFloor}.`;
	if (!placeLicencesAccepted.includes(sourceLicence)) return `${sourceId} ${placeLicenceRefused}`;
	return null;
}
