<script lang="ts">
	import AreaLegend from '$lib/components/clients/map/AreaLegend.svelte';
	import PatchMap from './PatchMap.svelte';
	import SectorLegend from './SectorLegend.svelte';
	import type { AreaPin } from '$lib/server/clients/area/areaPin';
	import type { DrawnSector } from './createPatchMap';
	import type { PostcodeLocation } from '$lib/server/postcodes/postcodeLocation';

	let {
		centre,
		radiusMiles,
		pins,
		sectors,
		selectedKey,
		selectedSector,
		onSelect,
		onPickSector
	}: {
		centre: PostcodeLocation;
		radiusMiles: number;
		pins: AreaPin[];
		sectors: DrawnSector[];
		selectedKey: string | null;
		selectedSector: string | null;
		onSelect: (key: string) => void;
		onPickSector: (sector: string) => void;
	} = $props();
</script>

<div class="flex flex-col gap-3">
	{#key centre.postcode + radiusMiles}
		<PatchMap {centre} {radiusMiles} {pins} {sectors} {selectedKey} {selectedSector} {onSelect} {onPickSector} />
	{/key}
	<SectorLegend />
	<AreaLegend />
</div>
