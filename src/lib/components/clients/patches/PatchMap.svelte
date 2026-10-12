<script lang="ts">
	import { onMount } from 'svelte';
	import { createPatchMap, type DrawnSector, type PatchMapHandle } from './createPatchMap';
	import type { AreaPin } from '$lib/server/clients/area/areaPin';
	import type { Building } from '$lib/server/buildings/buildingRecord';
	import type { Coordinates } from '$lib/data/distance';

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
		centre: Coordinates;
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

	let container: HTMLDivElement;
	let handle = $state<PatchMapHandle | null>(null);

	onMount(() => {
		let isUnmounted = false;
		createPatchMap(container, patchId, centre, radiusMiles).then((created) => {
			if (isUnmounted) return created.destroy();
			handle = created;
		});
		return () => {
			isUnmounted = true;
			handle?.destroy();
		};
	});

	$effect(() => {
		handle?.showSectors(sectors, selectedSector, onPickSector);
	});

	$effect(() => {
		handle?.showPins(pins, selectedKey, onSelect);
	});

	$effect(() => {
		handle?.showBuildings(pins, selectedBuildingId, onPickBuilding);
	});
</script>

<div
	bind:this={container}
	class="h-[28rem] w-full overflow-hidden rounded-2xl border border-hairline bg-carriage lg:h-[36rem]"
	aria-label="Map of the patch"
></div>
