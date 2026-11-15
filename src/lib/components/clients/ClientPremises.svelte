<script lang="ts">
	import { premisesAddressLine } from '$lib/data/premisesAddressLine';
	import { premisesSourceLabels } from '$lib/data/foodHygieneRules';
	import type { Premises } from '$lib/server/premises/premisesRecord';

	let { premises }: { premises: Premises[] } = $props();
</script>

{#each premises as place (place.id)}
	<p class="text-sm text-chalk/60">
		Trading at {premisesAddressLine(place)}
		{#if place.phone !== ''}· {place.phone}{/if}
		{#if place.ratingValue !== ''}· Food hygiene rating {place.ratingValue}{/if}
		·
		<a href={place.sourceUrl} target="_blank" rel="noreferrer" class="hover:text-signal">
			{place.isGone ? 'No longer listed by' : 'Listed by'} {premisesSourceLabels[place.source]}
		</a>
	</p>
{/each}
