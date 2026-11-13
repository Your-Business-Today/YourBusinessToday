<script lang="ts">
	import { stationState } from '$lib/data/workflowMap/workflowMap';
	import type { StationPlace } from './stationDetails';

	let { place }: { place: StationPlace } = $props();

	const earlierLead = 'Before:';
	const unnamedPlace = 'Not said';
	const isOurs = $derived(place.state === stationState.ours);
	const isPlanned = $derived(place.state === stationState.planned);
</script>

<p class="flex flex-col gap-0.5">
	<span class="flex items-center gap-2 text-chalk">
		{#if isOurs}
			<span class="h-2 w-2 shrink-0 rounded-full bg-go" aria-label="Done in one of our products"></span>
		{/if}
		{#if isPlanned}
			<span class="h-2 w-2 shrink-0 rounded-full border border-dashed border-go" aria-label="Planned"></span>
		{/if}
		{place.place ?? unnamedPlace}
	</span>
	{#if place.earlierPlace !== null}
		<span class="text-sm text-chalk-faint">{earlierLead} {place.earlierPlace}</span>
	{/if}
</p>
