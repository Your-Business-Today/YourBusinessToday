import { distanceInMiles, type Coordinates } from '$lib/data/distance';
import { oneCompany } from '$lib/data/hubPins';
import type { ClientStage } from '$lib/data/clientLifecycle';
import type { CompaniesHouseCompany } from '$lib/server/companiesHouse/searchCompaniesHouse';

export type RegisterStanding = { clientId: string; stage: ClientStage };

/** One pin on an area map: a company, a client, or a registered-office hub holding many companies. */
export type AreaPin = Coordinates & {
	key: string;
	companyNumber: string;
	name: string;
	address: string;
	postcode: string;
	incorporatedOn: string;
	sicCodes: string[];
	distanceMiles: number;
	standing: RegisterStanding | null;
	companyCount: number;
	isNonTrading: boolean;
	isSighting: boolean;
};

export function pinForCompany(
	company: CompaniesHouseCompany,
	location: Coordinates,
	centre: Coordinates,
	standing: RegisterStanding | null
): AreaPin {
	return {
		key: company.companyNumber,
		companyNumber: company.companyNumber,
		name: company.name,
		address: company.address,
		postcode: company.postcode,
		incorporatedOn: company.incorporatedOn,
		sicCodes: company.sicCodes,
		latitude: location.latitude,
		longitude: location.longitude,
		distanceMiles: distanceInMiles(centre, location),
		standing,
		companyCount: oneCompany,
		isNonTrading: false,
		isSighting: false
	};
}

export function byDistance(first: AreaPin, second: AreaPin): number {
	return first.distanceMiles - second.distanceMiles;
}

/** Company pins first; a register pin for a company already drawn is not drawn twice. */
export function mergePins(companyPins: AreaPin[], registerPins: AreaPin[]): AreaPin[] {
	const seen = new Set(companyPins.map((pin) => pin.key));
	return [...companyPins, ...registerPins.filter((pin) => !seen.has(pin.key))];
}
