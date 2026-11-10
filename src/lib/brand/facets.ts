export const facetKeys = [
	'look',
	'motion',
	'sound',
	'voice',
	'behaviour',
	'response',
	'audience'
] as const;

export type FacetKey = (typeof facetKeys)[number];

export type Facet = { key: FacetKey; label: string; question: string };

export const facets: Facet[] = [
	{ key: 'look', label: 'Look', question: 'How does the brand appear?' },
	{ key: 'motion', label: 'Motion', question: 'How does the brand move?' },
	{ key: 'sound', label: 'Sound', question: 'How does the brand sound?' },
	{ key: 'voice', label: 'Voice', question: 'How does the brand speak?' },
	{ key: 'behaviour', label: 'Behaviour', question: 'What does the brand do?' },
	{ key: 'response', label: 'Response', question: 'What does the brand ask its audience to do?' },
	{ key: 'audience', label: 'Audience', question: 'Who is the brand for?' }
];

export function isFacetKey(candidate: string): candidate is FacetKey {
	return (facetKeys as readonly string[]).includes(candidate);
}

