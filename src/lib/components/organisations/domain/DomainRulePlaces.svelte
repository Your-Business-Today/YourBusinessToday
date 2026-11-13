<script lang="ts">
	import { domainThingHref } from './domainTabs';
	import { workflowMapStationHref } from '$lib/components/organisations/organisationPages';
	import type { RulePlace } from '$lib/data/domainRulePlaces';

	let { places, organisationId }: { places: RulePlace[]; organisationId: string } = $props();

	const linkClasses = 'text-chalk transition hover:text-go';
</script>

<span class="flex flex-wrap gap-x-3 gap-y-1">
	{#each places as place (place.key)}
		{#if place.stationKey !== null}
			<a href={workflowMapStationHref(organisationId, place.stationKey)} class={linkClasses}>{place.words}</a>
		{:else if place.thingSlug !== null}
			<a href={domainThingHref(place.thingSlug)} class={linkClasses}>{place.words}</a>
		{:else}
			<span>{place.words}</span>
		{/if}
	{/each}
</span>
