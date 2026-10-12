import { postcodeIn } from '$lib/data/postcode';
import type { PlaceSeed } from '$lib/data/placeRules';

/** One row of the places query as a seed, or null when it carries no id, name or point. */
export function readPlaceRow(row: Record<string, unknown>): PlaceSeed | null {
	const sourceId = String(row.id ?? '').trim();
	const businessName = String(row.name ?? '').trim();
	const latitude = Number(row.latitude);
	const longitude = Number(row.longitude);
	if (sourceId === '' || businessName === '' || Number.isNaN(latitude) || Number.isNaN(longitude)) return null;
	return {
		sourceId,
		businessName,
		category: String(row.category ?? '').trim(),
		address: String(row.address ?? '').trim(),
		postcode: postcodeIn(String(row.postcode ?? '')),
		latitude,
		longitude,
		website: String(row.website ?? '').trim(),
		phone: String(row.phone ?? '').trim(),
		confidence: Number(row.confidence ?? 0) || 0,
		sourceLicence: String(row.licence ?? '').trim()
	};
}
