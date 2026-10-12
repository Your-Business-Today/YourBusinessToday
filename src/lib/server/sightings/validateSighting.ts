import { parsePublicUrl } from '$lib/server/clients/parsePublicUrl';
import { postcodeIn, sectorOf } from '$lib/data/postcode';
import {
	isRefusedSourceHost,
	longestSightingAddress,
	longestSightingName,
	longestSightingNote,
	parseSightingSource,
	sightingSourceOrder,
	type SightingSeed
} from '$lib/data/sightingRules';

export const sightingNeedsName = 'A sighting needs the business name.';
export const sightingNeedsSector = 'A sighting needs the sector it was made in, such as KT1 1.';
export const sightingNeedsNote = 'Say what the page showed about the business.';
export const sightingNeedsPublicPage = 'The source must be a public http(s) page the business can be read on.';
export const sightingSourceRefused = 'That page is behind a login or on a network whose terms forbid reading it this way; record what a public page says instead.';
export const sightingSourceKindRefusal = `The source kind is one of ${sightingSourceOrder.join(', ')}.`;

/** Why the sighting cannot be recorded as it stands, or null when every value fits its column. */
export function validateSighting(seed: SightingSeed): string | null {
	const { businessName, address, whatWasSeen, postcode, sector } = seed;
	if (sector === '') return sightingNeedsSector;
	if (businessName === '') return sightingNeedsName;
	if (businessName.length > longestSightingName) return `The business name is at most ${longestSightingName} characters.`;
	if (address.length > longestSightingAddress) return `The address is at most ${longestSightingAddress} characters.`;
	if (whatWasSeen === '') return sightingNeedsNote;
	if (whatWasSeen.length > longestSightingNote) return `What was seen is at most ${longestSightingNote} characters.`;
	if (parseSightingSource(seed.sourceKind) === null) return sightingSourceKindRefusal;
	const sectorOfPostcode = sectorOf(postcodeIn(postcode));
	if (postcode !== '' && sectorOfPostcode !== sector) return `${postcode} is not in sector ${sector}.`;
	return sourceRefusal(seed.sourceUrl);
}

function sourceRefusal(sourceUrl: string): string | null {
	const page = parsePublicUrl(sourceUrl);
	if (page === null) return sightingNeedsPublicPage;
	if (isRefusedSourceHost(page.hostname)) return sightingSourceRefused;
	return null;
}
