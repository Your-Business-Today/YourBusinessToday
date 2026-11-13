<script lang="ts">
	import ConstellationHud from './ConstellationHud.svelte';
	import NeuronDetailPanel from './NeuronDetailPanel.svelte';
	import NeuronTooltip from './NeuronTooltip.svelte';
	import { connectionsOf } from './neuronConnections';
	import type { ConstellationExploration } from './constellation/constellationExploration.svelte';
	import type { BrainContext, BrainPageLink, BrainPageSummary } from '$lib/data/brainTypes';

	let {
		exploration,
		pageHref,
		glanceHref,
		contexts,
		pageIndex,
		pageLinks
	}: {
		exploration: ConstellationExploration;
		pageHref: (slug: string) => string;
		glanceHref: (slug: string) => string;
		contexts: BrainContext[];
		pageIndex: BrainPageSummary[];
		pageLinks: BrainPageLink[];
	} = $props();

	const selectedPage = $derived(pageIndex.find((page) => page.slug === exploration.selectedSlug));
	const selectedContext = $derived(contexts.find((context) => context.slug === selectedPage?.contextSlug));
	const selectedConnections = $derived(selectedPage === undefined ? [] : connectionsOf(selectedPage.slug, pageLinks, pageIndex));
</script>

<ConstellationHud
	{contexts}
	{pageIndex}
	focusedContextSlug={exploration.focusedContextSlug}
	selectedSlug={exploration.selectedSlug}
	onReturnToModel={exploration.returnToModel}
	onReturnToContext={exploration.returnToContext}
/>
{#if exploration.hover !== null && selectedPage === undefined}
	<NeuronTooltip hover={exploration.hover} {contexts} {pageIndex} />
{/if}
{#if selectedPage !== undefined}
	<NeuronDetailPanel
		page={selectedPage}
		context={selectedContext}
		pageHref={pageHref(selectedPage.slug)}
		glanceHref={glanceHref(selectedPage.slug)}
		connections={selectedConnections}
		onOpenConnection={exploration.openNeuron}
		onClose={exploration.returnToContext}
	/>
{/if}
