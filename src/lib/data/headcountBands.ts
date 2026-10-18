import { validateChoice } from './choiceRules';

export type HeadcountBand = '' | '1-10' | '11-50' | '51-200' | '201-500' | '500+';

export const headcountBandOrder: HeadcountBand[] = ['', '1-10', '11-50', '51-200', '201-500', '500+'];

export const headcountBandLabels: Record<HeadcountBand, string> = {
	'': 'Unknown',
	'1-10': '1 to 10 people',
	'11-50': '11 to 50 people',
	'51-200': '51 to 200 people',
	'201-500': '201 to 500 people',
	'500+': 'More than 500 people'
};

export function parseHeadcountBand(value: unknown): HeadcountBand {
	const band = headcountBandOrder.find((candidate) => candidate === value);
	if (band === undefined) return '';
	return band;
}

/** Why a headcount band cannot be stored, or null when it is blank or one of the bands. */
export function validateHeadcountBand(value: unknown): string | null {
	return validateChoice('headcount band', value, headcountBandOrder);
}
