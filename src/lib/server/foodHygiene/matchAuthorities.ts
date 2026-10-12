import type { FoodAuthority } from './foodAuthorityRecord';

export type AuthorityMatch = { matched: FoodAuthority[]; unmatched: string[] };

const noise = /\b(london borough of|royal borough of|city of|metropolitan borough of|council|corporation|district|borough)\b/g;
const notALetter = /[^a-z]/g;

/** The authorities whose names are the districts postcodes.io gives the patch's outcodes; a district nobody matches is reported, not guessed. */
export function matchAuthoritiesToDistricts(authorities: FoodAuthority[], districts: string[]): AuthorityMatch {
	const byName = new Map(authorities.map((authority) => [normaliseAuthorityName(authority.name), authority]));
	const matched = new Map<string, FoodAuthority>();
	const unmatched: string[] = [];
	for (const district of new Set(districts)) {
		const authority = byName.get(normaliseAuthorityName(district)) ?? null;
		if (authority === null) {
			unmatched.push(district);
			continue;
		}
		matched.set(authority.code, authority);
	}
	return { matched: [...matched.values()], unmatched };
}

/** "Kingston upon Thames", "Kingston Upon Thames" and "Royal Borough of Kingston upon Thames" are one name. */
export function normaliseAuthorityName(name: string): string {
	return name.toLowerCase().replace(noise, ' ').replace(notALetter, '');
}
