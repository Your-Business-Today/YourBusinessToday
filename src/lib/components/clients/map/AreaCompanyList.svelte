<script lang="ts">
	import AreaCompanyRow from './AreaCompanyRow.svelte';
	import type { AreaPin } from '$lib/server/clients/area/areaPin';

	let {
		pins,
		selectedKey,
		onSelect
	}: { pins: AreaPin[]; selectedKey: string | null; onSelect: (key: string) => void } = $props();
</script>

<ul class="max-h-[36rem] divide-y divide-hairline overflow-y-auto rounded-2xl border border-hairline">
	{#each pins as pin (pin.key)}
		<AreaCompanyRow {pin} isSelected={pin.key === selectedKey} {onSelect} />
	{/each}
</ul>
