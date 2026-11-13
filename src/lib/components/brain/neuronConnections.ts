import { neuronKindLabel } from './neuronKinds';
import type { BrainPageLink, BrainPageSummary } from '$lib/data/brainTypes';

/** Which way a drawn link runs between the open page and another. */
export type ConnectionDirection = 'pointsTo' | 'pointedToBy';

/** One page the open page is drawn connected to: one synapse of its neuron. */
export type NeuronConnection = { slug: string; title: string; kindLabel: string; direction: ConnectionDirection };

/** How each direction reads in the panel. */
export const connectionDirectionWords: Record<ConnectionDirection, string> = {
	pointsTo: 'Points to',
	pointedToBy: 'Pointed to by'
};

/** The pages the open page's neuron is joined to, one for each synapse drawn, in the order of their titles. */
export function connectionsOf(slug: string, pageLinks: BrainPageLink[], pageIndex: BrainPageSummary[]): NeuronConnection[] {
	const pagesBySlug = new Map(pageIndex.map((page) => [page.slug, page]));
	const connections = pageLinks.flatMap((link) => {
		const direction = directionOf(link, slug);
		if (direction === null) return [];
		const otherSlug = direction === 'pointsTo' ? link.toSlug : link.fromSlug;
		const other = pagesBySlug.get(otherSlug);
		if (other === undefined) return [];
		return [{ slug: otherSlug, title: other.title, kindLabel: neuronKindLabel(other.kind), direction }];
	});
	return connections.sort((first, second) => first.title.localeCompare(second.title));
}

function directionOf(link: BrainPageLink, slug: string): ConnectionDirection | null {
	if (link.fromSlug === slug) return 'pointsTo';
	if (link.toSlug === slug) return 'pointedToBy';
	return null;
}
