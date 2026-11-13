import type { BrainPageLink } from '$lib/data/brainTypes';
import type { Neuron, Nucleus, Synapse } from './constellationTypes';

export function synapsesOf(
	neurons: Neuron[],
	nuclei: Nucleus[],
	pageLinks: BrainPageLink[]
): Synapse[] {
	return [...dendritesOf(neurons, nuclei), ...crosslinksOf(neurons, pageLinks)];
}

function dendritesOf(neurons: Neuron[], nuclei: Nucleus[]): Synapse[] {
	return neurons.flatMap((neuron) => {
		const nucleus = nuclei.find((candidate) => candidate.slug === neuron.contextSlug);
		if (nucleus === undefined) return [];
		return [
			{
				kind: 'dendrite' as const,
				contextSlug: nucleus.slug,
				fromSlug: nucleus.slug,
				toSlug: neuron.slug,
				from: nucleus.position,
				to: neuron.position
			}
		];
	});
}

function crosslinksOf(neurons: Neuron[], pageLinks: BrainPageLink[]): Synapse[] {
	return pageLinks.flatMap((link) => {
		const from = neurons.find((neuron) => neuron.slug === link.fromSlug);
		const to = neurons.find((neuron) => neuron.slug === link.toSlug);
		if (from === undefined || to === undefined) return [];
		const isWithinOneContext = from.contextSlug !== null && from.contextSlug === to.contextSlug;
		return [
			{
				kind: 'crosslink' as const,
				contextSlug: isWithinOneContext ? from.contextSlug : null,
				fromSlug: from.slug,
				toSlug: to.slug,
				from: from.position,
				to: to.position
			}
		];
	});
}
