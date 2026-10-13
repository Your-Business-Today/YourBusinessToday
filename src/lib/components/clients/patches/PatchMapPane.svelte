<script lang="ts">
	import AreaLegend from '$lib/components/clients/map/AreaLegend.svelte';
	import PatchMap from './PatchMap.svelte';
	import SectorLegend from './SectorLegend.svelte';
	import { foodHygieneCredit, overtureCredit } from '$lib/data/foodHygieneRules';
	import { sectorShapeCredit } from '$lib/data/sectorBoundarySources';
	import type { PatchMapProperties } from './patchMapProperties';
	import type { PostcodeLocation } from '$lib/server/postcodes/postcodeLocation';

	let {
		patchId,
		centre,
		radiusMiles,
		pins,
		sectors,
		selectedKey,
		selectedSector,
		selectedBuildingId,
		onSelect,
		onPickSector,
		onPickBuilding
	}: PatchMapProperties<PostcodeLocation> = $props();

	const year = new Date().getFullYear();
	const isDrawingShapes = $derived(sectors.some((drawn) => drawn.hasShape));
</script>

<div class="flex flex-col gap-3">
	{#key centre.postcode + radiusMiles}
		<PatchMap {patchId} {centre} {radiusMiles} {pins} {sectors} {selectedKey} {selectedSector} {selectedBuildingId} {onSelect} {onPickSector} {onPickBuilding} />
	{/key}
	<SectorLegend />
	<AreaLegend />
	<p class="text-xs text-chalk/40">Zoom to street level for the buildings, from OS OpenMap Local and OS Open UPRN. Contains OS data © Crown copyright and database right {year}. {foodHygieneCredit} {overtureCredit}</p>
	{#if isDrawingShapes}
		<p class="text-xs text-chalk/40">{sectorShapeCredit(year)}</p>
	{/if}
</div>
