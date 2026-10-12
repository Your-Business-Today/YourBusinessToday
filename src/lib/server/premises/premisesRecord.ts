import { parsePremisesSource } from './premisesSource';
import type { PremisesSource } from '$lib/data/foodHygieneRules';

/** A business trading at a real address, as an open register lists it. */
export type Premises = {
	id: string;
	source: PremisesSource;
	sourceId: string;
	businessName: string;
	businessType: string;
	address: string;
	postcode: string;
	sector: string;
	outcode: string;
	latitude: number | null;
	longitude: number | null;
	ratingValue: string;
	ratingDate: string | null;
	isNewRatingPending: boolean;
	firstSeenAt: string;
	lastSeenAt: string;
	isGone: boolean;
	sourceUrl: string;
	clientId: string | null;
};

export const premisesColumns =
	'id, source, source_id, business_name, business_type, address, postcode, sector, outcode, latitude, longitude, rating_value, rating_date, is_new_rating_pending, first_seen_at, last_seen_at, is_gone, source_url, client_id';

export function parsePremisesRecord(row: Record<string, unknown>): Premises {
	return {
		id: row.id as string,
		source: parsePremisesSource(row.source),
		sourceId: row.source_id as string,
		businessName: row.business_name as string,
		businessType: (row.business_type ?? '') as string,
		address: (row.address ?? '') as string,
		postcode: (row.postcode ?? '') as string,
		sector: (row.sector ?? '') as string,
		outcode: (row.outcode ?? '') as string,
		latitude: (row.latitude ?? null) as number | null,
		longitude: (row.longitude ?? null) as number | null,
		ratingValue: (row.rating_value ?? '') as string,
		ratingDate: (row.rating_date ?? null) as string | null,
		isNewRatingPending: Boolean(row.is_new_rating_pending),
		firstSeenAt: row.first_seen_at as string,
		lastSeenAt: row.last_seen_at as string,
		isGone: Boolean(row.is_gone),
		sourceUrl: (row.source_url ?? '') as string,
		clientId: (row.client_id ?? null) as string | null
	};
}
