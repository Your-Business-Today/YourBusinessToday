import { parseFoodAuthority, type FoodAuthority } from './foodAuthorityRecord';
import { foodHygieneApiOrigin, requestFoodHygiene } from './requestFoodHygiene';

const authoritiesPath = '/Authorities';

/** Every authority the agency publishes for, read once per sweep. */
export async function listFoodAuthorities(): Promise<FoodAuthority[]> {
	const body = await requestFoodHygiene(new URL(authoritiesPath, foodHygieneApiOrigin));
	return parseFoodAuthorities(body);
}

export function parseFoodAuthorities(body: unknown): FoodAuthority[] {
	const rows = (body as { authorities?: unknown })?.authorities;
	if (!Array.isArray(rows)) return [];
	return rows.flatMap((row) => {
		const authority = parseFoodAuthority(row);
		return authority === null ? [] : [authority];
	});
}
