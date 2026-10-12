<script lang="ts">
	import { formatBritishDate } from '$lib/data/britishDate';
	import type { PatchMap } from '$lib/server/patches/mapPatch';

	let { map, listedCount }: { map: PatchMap; listedCount: number } = $props();

	const facts = $derived(factsAbout(map));

	function factsAbout(mapped: PatchMap): string[] {
		const { pins } = mapped;
		if (mapped.asAtMonth === null) return [];
		return [
			`Register as at ${formatBritishDate(mapped.asAtMonth)}`,
			`${mapped.companyCount.toLocaleString('en-GB')} companies within ${mapped.radiusMiles} mile${mapped.radiusMiles === 1 ? '' : 's'}`,
			mapped.hubCount === 0 ? '' : `${mapped.hubCount} registered-office hub${mapped.hubCount === 1 ? '' : 's'}`,
			mapped.nonTradingCount === 0 ? '' : `${mapped.nonTradingCount} dormant or without accounts`,
			mapped.sightingCount === 0 ? '' : `${mapped.sightingCount} sighted on the web`,
			mapped.postcodesToGeocode === 0 ? '' : `${mapped.postcodesToGeocode} postcodes still to geocode`,
			pins.length > listedCount ? `the nearest ${listedCount} listed` : ''
		].filter((fact) => fact !== '');
	}
</script>

{#if map.asAtMonth === null}
	<p class="text-sm text-caution">
		The register has not been loaded for this patch yet: run the monthly Companies House file loader, then geocode its postcodes.
	</p>
{:else}
	<p class="text-sm text-chalk/70">{facts.join(' · ')}.</p>
{/if}
