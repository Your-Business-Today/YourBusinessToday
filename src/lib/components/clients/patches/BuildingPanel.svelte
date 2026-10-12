<script lang="ts">
	import { pinsBeside, pinsRegisteredAt } from '$lib/data/buildingNeighbours';
	import type { AreaPin } from '$lib/server/clients/area/areaPin';
	import type { Building } from '$lib/server/buildings/buildingRecord';

	let { building, pins, onSelect }: { building: Building; pins: AreaPin[]; onSelect: (key: string) => void } = $props();

	const beside = $derived(pinsBeside(building, pins));
	const registered = $derived(pinsRegisteredAt(building.nearestPostcode, pins));
	const sightingCount = $derived(beside.filter((pin) => pin.isSighting).length);
	const premisesCount = $derived(beside.filter((pin) => pin.isPremises).length);
	const headline = $derived(
		[
			`${building.uprnCount} addressable place${building.uprnCount === 1 ? '' : 's'}`,
			sightingCount === 0 ? '' : `${sightingCount} sighting${sightingCount === 1 ? '' : 's'}`,
			premisesCount === 0 ? '' : `${premisesCount} food premises`
		]
			.filter((part) => part !== '')
			.join(' · ') + (beside.length === 0 ? '' : ' in or beside it')
	);
	const postcodeLine = $derived(
		building.nearestPostcode === ''
			? 'No postcode near enough to name'
			: `Registered in postcode ${building.nearestPostcode}, centroid ${building.postcodeDistanceMetres ?? 0} m away`
	);
</script>

<aside class="flex flex-col gap-4 rounded-2xl border border-hairline bg-carriage p-5">
	<div class="flex flex-col gap-1">
		<h2 class="font-display text-xl font-medium">A building of {building.areaSquareMetres} m²</h2>
		<p class="text-sm text-chalk/80">{headline}</p>
		{#if beside.length === 0}
			<p class="text-xs text-chalk/50">Nothing is known to trade here yet: a place to send your Claude next.</p>
		{/if}
	</div>
	{#if beside.length > 0}
		<ul class="divide-y divide-hairline text-sm">
			{#each beside as pin (pin.key)}
				<li><button type="button" class="w-full py-1.5 text-left hover:text-go" onclick={() => onSelect(pin.key)}>{pin.name}</button></li>
			{/each}
		</ul>
	{/if}
	<div class="flex flex-col gap-1">
		<h3 class="text-xs font-medium uppercase tracking-wide text-chalk/50">{postcodeLine}</h3>
		{#if registered.length > 0}
			<ul class="divide-y divide-hairline text-sm">
				{#each registered as pin (pin.key)}
					<li><button type="button" class="w-full py-1.5 text-left hover:text-go" onclick={() => onSelect(pin.key)}>{pin.name}</button></li>
				{/each}
			</ul>
		{:else}
			<p class="text-xs text-chalk/50">No company on the register gives this postcode.</p>
		{/if}
	</div>
</aside>
