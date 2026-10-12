import { parseEstablishment, type Establishment } from './establishmentRecord';
import { foodHygieneSiteOrigin, requestFoodHygiene } from './requestFoodHygiene';

const openDataFilesPath = '/api/open-data-files/';

/** Every establishment in one authority's open-data file, fetched only when the sweep knows the file moved. */
export async function readAuthorityFile(fileName: string): Promise<Establishment[]> {
	const body = await requestFoodHygiene(new URL(`${openDataFilesPath}${fileName}.json`, foodHygieneSiteOrigin));
	return establishmentsIn(body);
}

/** The file wraps its rows two ways across versions: a bare array, or an object holding EstablishmentDetail. */
export function establishmentsIn(body: unknown): Establishment[] {
	const root = (body as { FHRSEstablishment?: unknown })?.FHRSEstablishment ?? body;
	const collection = (root as { EstablishmentCollection?: unknown })?.EstablishmentCollection;
	const rows = Array.isArray(collection) ? collection : (collection as { EstablishmentDetail?: unknown })?.EstablishmentDetail;
	if (!Array.isArray(rows)) return [];
	return rows.flatMap((row) => {
		const establishment = parseEstablishment(row);
		return establishment === null ? [] : [establishment];
	});
}
