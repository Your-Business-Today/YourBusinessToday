import type { ConstellationModel, Synapse } from './constellationTypes';

/** What the person is looking at: the whole brain, one area, or one page and what it connects to. */
export type LabelAttention = { contextSlug: string | null; neuronSlug: string | null };

/** How a label reads: an area's name, a page's title, or the title of the page that is open. */
export const labelRoles = { area: 'area', page: 'page', opened: 'opened' } as const;

export type LabelRole = (typeof labelRoles)[keyof typeof labelRoles];

export type ChosenLabel = { slug: string; role: LabelRole };

export const wholeBrainAttention: LabelAttention = { contextSlug: null, neuronSlug: null };

/** The labels worth showing for what is looked at, most wanted first, so a crowded label gives way to a more wanted one. */
export function labelsWorthShowing(model: ConstellationModel, attention: LabelAttention): ChosenLabel[] {
	const { contextSlug, neuronSlug } = attention;
	if (neuronSlug !== null) return labelsAroundPage(model, neuronSlug);
	if (contextSlug !== null) return labelsInArea(model, contextSlug);
	return areaLabelsLargestFirst(model);
}

function areaLabelsLargestFirst(model: ConstellationModel): ChosenLabel[] {
	const pageCountOf = (areaSlug: string) => model.neurons.filter((neuron) => neuron.contextSlug === areaSlug).length;
	const largestFirst = [...model.nuclei].sort((first, second) => pageCountOf(second.slug) - pageCountOf(first.slug));
	return largestFirst.map((nucleus) => ({ slug: nucleus.slug, role: 'area' }));
}

function labelsInArea(model: ConstellationModel, areaSlug: string): ChosenLabel[] {
	const crosslinks = crosslinksOf(model);
	const connectionCountOf = (slug: string) => crosslinks.filter((synapse) => touches(synapse, slug)).length;
	const pages = model.neurons.filter((neuron) => neuron.contextSlug === areaSlug);
	const bestConnectedFirst = pages.sort((first, second) => connectionCountOf(second.slug) - connectionCountOf(first.slug));
	const pageLabels: ChosenLabel[] = bestConnectedFirst.map((neuron) => ({ slug: neuron.slug, role: 'page' }));
	return [{ slug: areaSlug, role: 'area' }, ...pageLabels];
}

function labelsAroundPage(model: ConstellationModel, neuronSlug: string): ChosenLabel[] {
	const connectedSlugs = crosslinksOf(model)
		.filter((synapse) => touches(synapse, neuronSlug))
		.map((synapse) => (synapse.fromSlug === neuronSlug ? synapse.toSlug : synapse.fromSlug));
	const uniqueConnections = [...new Set(connectedSlugs)];
	const connectionLabels: ChosenLabel[] = uniqueConnections.map((slug) => ({ slug, role: 'page' }));
	return [{ slug: neuronSlug, role: 'opened' }, ...connectionLabels];
}

function crosslinksOf(model: ConstellationModel): Synapse[] {
	return model.synapses.filter((synapse) => synapse.kind === 'crosslink');
}

function touches(synapse: Synapse, slug: string): boolean {
	return synapse.fromSlug === slug || synapse.toSlug === slug;
}
