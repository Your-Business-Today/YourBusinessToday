export type LeadSource = 'staff' | 'website' | 'research' | 'companies_house' | 'sighting' | 'food_hygiene' | 'places_dataset' | 'sign_up';

export const leadSourceOrder: LeadSource[] = [
	'staff',
	'website',
	'research',
	'companies_house',
	'sighting',
	'food_hygiene',
	'places_dataset',
	'sign_up'
];

export const leadSourceLabels: Record<LeadSource, string> = {
	staff: 'Added by staff',
	website: 'Enquired through the website',
	research: 'Researched',
	companies_house: 'Found on Companies House',
	sighting: 'Sighted on the web',
	food_hygiene: 'From the Food Standards Agency',
	places_dataset: 'From a places dataset',
	sign_up: 'Signed up on the website'
};

export function parseLeadSource(value: unknown): LeadSource {
	const source = leadSourceOrder.find((candidate) => candidate === value);
	if (source === undefined) return 'staff';
	return source;
}
