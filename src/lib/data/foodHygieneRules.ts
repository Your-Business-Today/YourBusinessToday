/** Where a premises row came from: the open register that names a business at its trading address. */
export type PremisesSource = 'food_hygiene' | 'places_dataset';

export const premisesSources = { foodHygiene: 'food_hygiene', placesDataset: 'places_dataset' } as const;

export const premisesSourceLabels: Record<PremisesSource, string> = { food_hygiene: 'the Food Standards Agency', places_dataset: 'Overture Maps Places' };

/** The credit Overture asks for wherever its places are shown. */
export const overtureCredit = 'Trading places from the Overture Maps Foundation, CDLA-Permissive 2.0, with their sources\' own licences.';

/** The rating values the scheme gives besides 0 to 5: England, Wales and Northern Ireland, then Scotland's FHIS. */
export const ratingValues = {
	awaitingInspection: 'AwaitingInspection',
	awaitingPublication: 'AwaitingPublication',
	exempt: 'Exempt',
	pass: 'Pass',
	passAndEatSafe: 'Pass and Eat Safe',
	improvementRequired: 'Improvement Required'
} as const;

export const longestPremisesName = 200;
export const longestPremisesType = 100;
export const longestPremisesAddress = 300;
export const longestRatingValue = 40;

/** The credit the licence asks for wherever the agency's data is shown. */
export const foodHygieneCredit =
	'Food hygiene ratings from the Food Standards Agency. Contains public sector information licensed under the Open Government Licence v3.0.';
