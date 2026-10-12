import type { SupabaseClient } from '@supabase/supabase-js';
import { distanceInMiles, type Coordinates } from '$lib/data/distance';
import { parseClientStage } from '$lib/data/clientLifecycle';
import { geocodePostcodes } from '$lib/server/postcodes/geocodePostcodes';
import { postcodeIn } from '$lib/data/postcode';
import { oneCompany } from '$lib/data/hubPins';
import type { AreaPin } from './areaPin';

type RegisterRow = {
	id: string;
	name: string;
	address: string;
	postcode: string;
	company_number: string;
	lifecycle_stage: string;
};

export async function findRegisterAround(
	supabase: SupabaseClient,
	centre: Coordinates,
	radiusMiles: number
): Promise<AreaPin[]> {
	const rows = await readClientsWithPostcodes(supabase);
	const located = await geocodePostcodes(supabase, rows.map((row) => row.postcode));
	return rows
		.flatMap((row) => {
			const location = located.get(postcodeIn(row.postcode));
			if (location === undefined) return [];
			return [pinForClient(row, location, centre)];
		})
		.filter((pin) => pin.distanceMiles <= radiusMiles);
}

async function readClientsWithPostcodes(supabase: SupabaseClient): Promise<RegisterRow[]> {
	const { data, error } = await supabase
		.from('clients')
		.select('id, name, address, postcode, company_number, lifecycle_stage')
		.neq('postcode', '')
		.eq('is_archived', false);
	if (error) throw error;
	return data as RegisterRow[];
}

function pinForClient(row: RegisterRow, location: Coordinates, centre: Coordinates): AreaPin {
	return {
		key: row.company_number === '' ? row.id : row.company_number,
		companyNumber: row.company_number,
		name: row.name,
		address: row.address,
		postcode: row.postcode,
		incorporatedOn: '',
		sicCodes: [],
		latitude: location.latitude,
		longitude: location.longitude,
		distanceMiles: distanceInMiles(centre, location),
		standing: { clientId: row.id, stage: parseClientStage(row.lifecycle_stage) },
		companyCount: oneCompany,
		isNonTrading: false
	};
}
