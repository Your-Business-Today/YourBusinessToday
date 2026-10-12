import { outcodeOf, postcodeIn, sectorOf } from '$lib/data/postcode';
import { foodHygieneSiteOrigin } from './requestFoodHygiene';

/** One establishment as the open-data file describes it, read against the premises columns. */
export type Establishment = {
	fhrsId: string;
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
	authorityCode: string;
	sourceUrl: string;
};

const addressLines = ['AddressLine1', 'AddressLine2', 'AddressLine3', 'AddressLine4'];
const isoDate = /^\d{4}-\d{2}-\d{2}/;

/** The establishment, or null when the row carries no id or name and so cannot be a premises. */
export function parseEstablishment(value: unknown): Establishment | null {
	if (typeof value !== 'object' || value === null) return null;
	const row = value as Record<string, unknown>;
	const fhrsId = String(row.FHRSID ?? '').trim();
	const businessName = String(row.BusinessName ?? '').trim();
	if (fhrsId === '' || businessName === '') return null;
	const postcode = postcodeIn(String(row.PostCode ?? ''));
	const geocode = (row.Geocode ?? {}) as Record<string, unknown>;
	return {
		fhrsId,
		businessName,
		businessType: String(row.BusinessType ?? '').trim(),
		address: addressLines.map((line) => String(row[line] ?? '').trim()).filter((line) => line !== '').join(', '),
		postcode,
		sector: sectorOf(postcode),
		outcode: outcodeOf(postcode),
		latitude: coordinateOf(geocode.Latitude),
		longitude: coordinateOf(geocode.Longitude),
		ratingValue: String(row.RatingValue ?? '').trim(),
		ratingDate: isoDateOf(row.RatingDate),
		isNewRatingPending: isTrue(row.NewRatingPending),
		authorityCode: String(row.LocalAuthorityCode ?? '').trim(),
		sourceUrl: `${foodHygieneSiteOrigin}/business/${fhrsId}`
	};
}

function coordinateOf(value: unknown): number | null {
	if (value === null || value === undefined || value === '') return null;
	const number = Number(value);
	return Number.isNaN(number) ? null : number;
}

function isoDateOf(value: unknown): string | null {
	const match = isoDate.exec(String(value ?? ''));
	return match === null ? null : match[0];
}

/** The file writes True and False as words; a boolean is honoured too. */
function isTrue(value: unknown): boolean {
	if (typeof value === 'boolean') return value;
	return String(value ?? '').trim().toLowerCase() === 'true';
}
