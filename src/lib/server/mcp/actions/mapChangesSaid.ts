import type { MapChanges } from '$lib/data/workflowMap/workflowMapAmendment';

const changeHeadings: [keyof MapChanges, string][] = [
	['added', 'Added'],
	['replaced', 'Replaced'],
	['moved', 'Moved'],
	['removed', 'Removed'],
	['removedWith', 'Removed with them']
];

/** What an amendment changed, a sentence for each kind of change it made: "Added station "x" on line "sales"." */
export function mapChangesSaid(changes: MapChanges): string {
	const sentences = changeHeadings.filter(([kind]) => changes[kind].length > 0).map(([kind, heading]) => `${heading}: ${changes[kind].join(', ')}.`);
	if (sentences.length === 0) return 'Nothing changed: every part named was already on the map as given.';
	return sentences.join(' ');
}
