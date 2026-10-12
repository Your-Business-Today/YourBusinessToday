<script lang="ts">
	import { formatBritishDate } from '$lib/data/britishDate';
	import { sightingSourceLabels } from '$lib/data/sightingRules';
	import type { Sighting } from '$lib/server/sightings/sightingRecord';

	let { sighting, seenByName }: { sighting: Sighting; seenByName: string } = $props();
</script>

<li class="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
	<div class="flex flex-col gap-1">
		<p class="font-display text-lg">
			{sighting.businessName}
			{#if sighting.clientId !== null}
				<a href={`/clients/${sighting.clientId}`} class="ml-2 text-xs text-go hover:underline">on the register</a>
			{/if}
		</p>
		<p class="text-sm text-chalk/60">{sighting.sector}{sighting.address === '' ? '' : ` · ${sighting.address}`}</p>
		<p class="text-sm text-chalk/70">{sighting.whatWasSeen}</p>
		<a href={sighting.sourceUrl} target="_blank" rel="noreferrer" class="text-xs text-chalk/50 hover:text-signal">
			Seen on {sightingSourceLabels[sighting.sourceKind]} by {seenByName}, {formatBritishDate(sighting.seenAt)}
		</a>
	</div>
</li>
