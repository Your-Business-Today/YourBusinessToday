<script lang="ts">
	import AreaLegend from './AreaLegend.svelte';
	import AreaMap from './AreaMap.svelte';
	import type { AreaMap as MappedArea } from '$lib/server/clients/area/mapArea';

	let {
		area,
		selectedKey,
		onSelect
	}: { area: MappedArea; selectedKey: string | null; onSelect: (key: string) => void } = $props();
</script>

<div class="flex flex-col gap-3">
	{#key area.centre.postcode + area.radiusMiles}
		<AreaMap centre={area.centre} radiusMiles={area.radiusMiles} pins={area.pins} {selectedKey} {onSelect} />
	{/key}
	<AreaLegend />
</div>
