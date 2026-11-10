/** The age bands the ad platforms report a paid campaign's audience in (migration 0180), youngest first. */
export const ageBands = ['13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+', 'unknown'] as const;

/** The genders the ad platforms report a paid campaign's audience by (migration 0180). */
export const genders = ['female', 'male', 'unknown'] as const;

export type AgeBand = (typeof ageBands)[number];

export type Gender = (typeof genders)[number];

/** How the page names each band, so unknown reads as the platform means it. */
export const ageBandLabels: Record<AgeBand, string> = {
	'13-17': '13 to 17',
	'18-24': '18 to 24',
	'25-34': '25 to 34',
	'35-44': '35 to 44',
	'45-54': '45 to 54',
	'55-64': '55 to 64',
	'65+': '65 and over',
	unknown: 'Age not known'
};

export const genderLabels: Record<Gender, string> = {
	female: 'Women',
	male: 'Men',
	unknown: 'Gender not known'
};

export function isAgeBand(candidate: string): candidate is AgeBand {
	return (ageBands as readonly string[]).includes(candidate);
}

export function isGender(candidate: string): candidate is Gender {
	return (genders as readonly string[]).includes(candidate);
}
