<script lang="ts">
	import AreaLegend from '$lib/components/clients/map/AreaLegend.svelte';
	import PatchMap from './PatchMap.svelte';
	import SectorLegend from './SectorLegend.svelte';
	import { foodHygieneCredit } from '$lib/data/foodHygieneRules';
	import type { AreaPin } from '$lib/server/clients/area/areaPin';
	import type { Building } from '$lib/server/buildings/buildingRecord';
	import type { DrawnSector } from './createPatchMap';
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
	}: {
		patchId: string;
		centre: PostcodeLocation;
		radiusMiles: number;
		pins: AreaPin[];
		sectors: DrawnSector[];
		selectedKey: string | null;
		selectedSector: string | null;
		selectedBuildingId: string | null;
		onSelect: (key: string) => void;
		onPickSector: (sector: string) => void;
		onPickBuilding: (building: Building) => void;
	} = $props();
</script>

<div class="flex flex-col gap-3">
	{#key centre.postcode + radiusMiles}
		<PatchMap {patchId} {centre} {radiusMiles} {pins} {sectors} {selectedKey} {selectedSector} {selectedBuildingId} {onSelect} {onPickSector} {onPickBuilding} />
	{/key}
	<SectorLegend />
	<AreaLegend />
	<p class="text-xs text-chalk/40">Zoom to street level for the buildings, from OS OpenMap Local and OS Open UPRN. Contains OS data © Crown copyright and database right {new Date().getFullYear()}. {foodHygieneCredit}</p>
</div>
