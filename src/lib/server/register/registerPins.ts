import { distanceInMiles, type Coordinates } from '$lib/data/distance';
import { isNonTradingCategory, oneCompany } from '$lib/data/registerRules';
import type { AreaPin } from '$lib/server/clients/area/areaPin';
import type { LocatedRegisterCompany } from './registerCompanyRecord';
import { groupByAddress, hubAddressesIn } from './hubAddresses';
import type { StandingByCompanyNumber } from '$lib/server/clients/area/findRegisterStanding';

export type RegisterPins = { pins: AreaPin[]; companyCount: number; hubCount: number; nonTradingCount: number };

const hubName = 'Registered-office hub';

/** The companies within the radius as pins: one per company, or one per hub where many share an address. */
export function pinsForRegister(
	companies: LocatedRegisterCompany[],
	centre: Coordinates,
	radiusMiles: number,
	standings: StandingByCompanyNumber
): RegisterPins {
	const within = companies.filter((company) => distanceInMiles(centre, company) <= radiusMiles);
	const hubs = hubAddressesIn(within);
	const pins: AreaPin[] = [];
	for (const [address, residents] of groupByAddress(within)) {
		const isHubAddress = hubs.has(address);
		pins.push(...pinsForAddress(isHubAddress, address, residents, centre, standings));
	}
	return {
		pins,
		companyCount: within.length,
		hubCount: hubs.size,
		nonTradingCount: within.filter((company) => isNonTradingCategory(company.accountCategory)).length
	};
}

function pinsForAddress(
	isHubAddress: boolean,
	address: string,
	residents: LocatedRegisterCompany[],
	centre: Coordinates,
	standings: StandingByCompanyNumber
): AreaPin[] {
	if (isHubAddress) return [hubPin(address, residents, centre)];
	return residents.map((company) => companyPin(company, centre, standings));
}

function companyPin(company: LocatedRegisterCompany, centre: Coordinates, standings: StandingByCompanyNumber): AreaPin {
	return {
		key: company.companyNumber,
		companyNumber: company.companyNumber,
		name: company.name,
		address: company.registeredAddress,
		postcode: company.postcode,
		incorporatedOn: company.incorporatedOn,
		sicCodes: company.sicCodes,
		latitude: company.latitude,
		longitude: company.longitude,
		distanceMiles: distanceInMiles(centre, company),
		standing: standings.get(company.companyNumber) ?? null,
		companyCount: oneCompany,
		isNonTrading: isNonTradingCategory(company.accountCategory),
		isSighting: false,
		isPremises: false
	};
}

function hubPin(address: string, residents: LocatedRegisterCompany[], centre: Coordinates): AreaPin {
	const [first] = residents;
	return {
		key: `hub:${address}`,
		companyNumber: '',
		name: hubName,
		address: first.registeredAddress,
		postcode: first.postcode,
		incorporatedOn: '',
		sicCodes: [],
		latitude: first.latitude,
		longitude: first.longitude,
		distanceMiles: distanceInMiles(centre, first),
		standing: null,
		companyCount: residents.length,
		isNonTrading: false,
		isSighting: false,
		isPremises: false
	};
}
