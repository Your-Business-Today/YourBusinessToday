<script lang="ts">
	import ListedWebsite from './ListedWebsite.svelte';
	import { premisesAddressLine } from '$lib/data/premisesAddressLine';
	import { pageListedBeside } from '$lib/data/premisesListedPage';
	import { premisesSourceLabels } from '$lib/data/foodHygieneRules';
	import type { Premises } from '$lib/server/premises/premisesRecord';

	let { premises, website }: { premises: Premises[]; website: string } = $props();
</script>

{#each premises as place (place.id)}
	{@const listedPage = pageListedBeside(website, place.website)}
	<p class="text-sm text-chalk/60">
		Trading at {premisesAddressLine(place)}
		{#if place.phone !== ''}· {place.phone}{/if}
		{#if listedPage !== ''}· <ListedWebsite address={listedPage} />{/if}
		{#if place.ratingValue !== ''}· Food hygiene rating {place.ratingValue}{/if}
		·
		<a href={place.sourceUrl} target="_blank" rel="noreferrer" class="hover:text-signal">
			{place.isGone ? 'No longer listed by' : 'Listed by'} {premisesSourceLabels[place.source]}
		</a>
	</p>
{/each}
