<script lang="ts">
	import JourneySwatch from './JourneySwatch.svelte';
	import { viewPassesAt } from './viewPasses';
	import type { JourneyMap } from '$lib/data/journeyMap/journeyMap';
	import type { LineColour } from '$lib/components/lineMap/layout/lineMapModel';

	let { journeyMap, route, colours }: { journeyMap: JourneyMap; route: string; colours: Map<string, LineColour> } = $props();

	const passes = $derived(viewPassesAt(journeyMap, route, colours));
</script>

<section class="flex flex-col gap-1.5">
	<h3 class="font-display text-xs tracking-widest text-chalk/50 uppercase">On these journeys</h3>
	{#if passes.length === 0}
		<p class="text-xs text-caution">No journey passes through this view.</p>
	{/if}
	<ul class="flex flex-col gap-2">
		{#each passes as pass (pass.key)}
			<li class="flex flex-col gap-0.5">
				<span class="flex flex-wrap items-center gap-2 text-chalk">
					<JourneySwatch colour={pass.colour} />
					{pass.name}
					<span class="text-xs text-chalk-subtle">{pass.role}, {pass.step}</span>
				</span>
				{#if pass.does !== null}
					<span class="pl-5 text-xs text-chalk-muted">{pass.does}</span>
				{/if}
			</li>
		{/each}
	</ul>
</section>
