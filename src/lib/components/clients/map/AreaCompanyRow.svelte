<script lang="ts">
	import StagePill from '$lib/components/clients/StagePill.svelte';
	import { describeDistance } from '$lib/data/distance';
	import type { AreaPin } from '$lib/server/clients/area/areaPin';

	let {
		pin,
		isSelected,
		onSelect
	}: { pin: AreaPin; isSelected: boolean; onSelect: (key: string) => void } = $props();

	const standing = $derived(pin.standing);
</script>

<li>
	<button
		type="button"
		onclick={() => onSelect(pin.key)}
		aria-pressed={isSelected}
		class={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition
			hover:bg-carriage ${isSelected ? 'bg-carriage' : ''}`}
	>
		<span class="min-w-0">
			<span class="block truncate font-display text-sm">{pin.name}</span>
			<span class="block truncate text-xs text-chalk/50">{pin.address}</span>
		</span>
		<span class="flex shrink-0 items-center gap-2 text-xs text-chalk/50">
			{#if standing !== null}
				<StagePill stage={standing.stage} />
			{/if}
			{describeDistance(pin.distanceMiles)}
		</span>
	</button>
</li>
