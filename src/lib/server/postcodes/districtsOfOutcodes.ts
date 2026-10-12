import { postcodesApiOrigin, requestPostcodes } from './postcodesRequest';

const outcodesPath = '/outcodes/';

/** The local authority districts every postcode of each outcode falls in, as postcodes.io derives them across the outcode. */
export async function readDistrictsOfOutcodes(outcodes: string[]): Promise<Map<string, string[]>> {
	const entries = await Promise.all(outcodes.map(async (outcode) => [outcode, await districtsOf(outcode)] as const));
	return new Map(entries);
}

async function districtsOf(outcode: string): Promise<string[]> {
	const body = await requestPostcodes(new URL(`${outcodesPath}${encodeURIComponent(outcode)}`, postcodesApiOrigin));
	const result = (body.result ?? {}) as Record<string, unknown>;
	const districts = Array.isArray(result.admin_district) ? result.admin_district : [];
	return districts.map((district) => String(district ?? '')).filter((district) => district !== '');
}
