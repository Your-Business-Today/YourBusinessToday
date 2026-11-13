<script lang="ts">
	import ConstellationHud from './ConstellationHud.svelte';
	import NeuronDetailPanel from './NeuronDetailPanel.svelte';
	import NeuronTooltip from './NeuronTooltip.svelte';
	import type { ConstellationExploration } from './constellation/constellationExploration.svelte';
	import type { BrainContext, BrainPageSummary } from '$lib/data/brainTypes';

	let {
		exploration,
		pageHref,
		contexts,
		pageIndex
	}: {
		exploration: ConstellationExploration;
		pageHref: (slug: string) => string;
		contexts: BrainContext[];
		pageIndex: BrainPageSummary[];
	} = $props();

	const selectedPage = $derived(pageIndex.find((page) => page.slug === exploration.selectedSlug));
	const selectedContext = $derived(contexts.find((context) => context.slug === selectedPage?.contextSlug));
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
		onClose={exploration.returnToContext}
	/>
{/if}
