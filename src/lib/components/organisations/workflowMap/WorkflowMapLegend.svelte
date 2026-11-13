<script lang="ts">
	import LegendSample from './LegendSample.svelte';
	import { legendItemsOf } from './workflowMapLegend';
	import type { MapStage } from '$lib/data/workflowMap/workflowMap';

	let { stage }: { stage: MapStage } = $props();

	const items = $derived(legendItemsOf(stage));
</script>

<ul aria-label="What the marks mean" class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-chalk-muted">
	{#each items as item (item.mark)}
		<li class="flex items-center gap-2">
			<LegendSample mark={item.mark} />
			{item.words}
		</li>
	{/each}
</ul>
