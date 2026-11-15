import { placeLicencesAccepted, type PlaceSeed } from '$lib/data/placeRules';
import { postcodeIn } from '$lib/data/postcode';
import type { MapBounds } from '$lib/data/mapBounds';
import type { OverturePlace, PlaceSource } from './overturePlace';

const closedForGood = 'permanently_closed';

/** Whether the release says the place has closed for good: it is not loaded, and one already held is marked gone. */
export function isClosedForGood(place: OverturePlace): boolean {
	return place.operating_status === closedForGood;
}

/** Whether the corner of the place's box, which for a point is the point, lies in the box on the ground. */
export function isPlaceIn(place: OverturePlace, bounds: MapBounds): boolean {
	const { bbox } = place;
	const latitude = coordinateOf(bbox?.ymin);
	const longitude = coordinateOf(bbox?.xmin);
	if (latitude === null || longitude === null) return false;
	return longitude >= bounds.west && longitude <= bounds.east && latitude >= bounds.south && latitude <= bounds.north;
}

/**
 * The place as a seed, or null when it carries no id, name or point. The point is the corner of its box, the category
 * the taxonomy's primary entry, and the website, phone and address the first the release lists.
 */
export function placeSeedOf(place: OverturePlace): PlaceSeed | null {
	const { names, taxonomy, bbox, confidence } = place;
	const sourceId = textOf(place.id);
	const businessName = textOf(names?.primary);
	const latitude = coordinateOf(bbox?.ymin);
	const longitude = coordinateOf(bbox?.xmin);
	if (sourceId === '' || businessName === '' || latitude === null || longitude === null) return null;
	const [address] = place.addresses ?? [];
	const [website] = place.websites ?? [];
	const [phone] = place.phones ?? [];
	return {
		sourceId,
		businessName,
		category: textOf(taxonomy?.primary),
		address: textOf(address?.freeform),
		postcode: postcodeIn(textOf(address?.postcode)),
		latitude,
		longitude,
		website: textOf(website),
		phone: textOf(phone),
		confidence: confidence ?? 0,
		sourceLicence: strictestLicenceOf(place.sources ?? [])
	};
}

/**
 * The licence the place is judged by. A place's facts come from several sources, each under its own licence, so one
 * source we may not hold is enough to refuse the place: that licence is the one given, and the first listed otherwise.
 */
export function strictestLicenceOf(sources: (PlaceSource | null)[]): string {
	const licences = sources.map((source) => textOf(source?.license));
	const [firstListed] = licences;
	return licences.find((licence) => !placeLicencesAccepted.includes(licence)) ?? firstListed ?? '';
}

function textOf(value: string | null | undefined): string {
	return (value ?? '').trim();
}

function coordinateOf(value: number | null | undefined): number | null {
	return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
