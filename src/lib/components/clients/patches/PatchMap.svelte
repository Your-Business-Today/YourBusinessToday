<script lang="ts">
	import { onMount } from 'svelte';
	import { createPatchMap, type PatchMapHandle } from './createPatchMap';
	import type { PatchMapProperties } from './patchMapProperties';

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
	}: PatchMapProperties = $props();

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
