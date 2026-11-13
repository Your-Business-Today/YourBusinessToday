<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import JourneySwatch from './JourneySwatch.svelte';
	import { journeySiteMapMessages } from './journeySiteMapWords';
	import type { JourneyMark } from './journeyViewRows';

	let { journeys }: { journeys: JourneyMark[] } = $props();
</script>

{#if journeys.length === 0}
	<Badge label={journeySiteMapMessages.onNoJourney} tone="warning" />
{:else}
	<span class="flex flex-col gap-0.5">
		{#each journeys as journey (journey.key)}
			<span class="flex items-center gap-2"><JourneySwatch colour={journey.colour} />{journey.name}</span>
		{/each}
	</span>
{/if}
