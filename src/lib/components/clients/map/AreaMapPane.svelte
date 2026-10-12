<script lang="ts">
	import AreaLegend from './AreaLegend.svelte';
	import AreaMap from './AreaMap.svelte';
	import type { AreaPin } from '$lib/server/clients/area/areaPin';
	import type { Coordinates } from '$lib/data/distance';

	type MappedArea = { centre: Coordinates & { postcode: string }; radiusMiles: number; pins: AreaPin[] };

	let {
		area,
		selectedKey,
		onSelect
	}: { area: MappedArea; selectedKey: string | null; onSelect: (key: string) => void } = $props();

	const { centre, radiusMiles, pins } = $derived(area);
</script>

<div class="flex flex-col gap-3">
	{#key centre.postcode + radiusMiles}
		<AreaMap {centre} {radiusMiles} {pins} {selectedKey} {onSelect} />
	{/key}
	<AreaLegend />
</div>
