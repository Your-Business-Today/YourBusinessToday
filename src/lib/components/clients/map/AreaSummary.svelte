<script lang="ts">
	import type { AreaMap } from '$lib/server/clients/area/mapArea';

	let { area }: { area: AreaMap } = $props();

	const heldCount = $derived(area.pins.filter((pin) => pin.standing !== null).length);
	const summary = $derived(describe(area, heldCount));

	function describe(mapped: AreaMap, held: number): string {
		const { pins, centre } = mapped;
		const within = `${pins.length} compan${pins.length === 1 ? 'y' : 'ies'} within ${mapped.radiusMiles} mile${mapped.radiusMiles === 1 ? '' : 's'} of ${centre.postcode}`;
		const onRegister = `${held} already on the register`;
		if (!mapped.isSearchedOnCompaniesHouse) return `${within}, all from our register — ${onRegister}.`;
		if (mapped.companiesHouseHits > pins.length) {
			return `${within} (Companies House holds ${mapped.companiesHouseHits} around here; the nearest are shown — narrow with SIC codes or a smaller radius to see the rest) — ${onRegister}.`;
		}
		return `${within} — ${onRegister}.`;
	}
</script>

<div class="flex flex-col gap-1">
	<p class="text-sm text-chalk/70">{summary}</p>
	{#if !area.isSearchedOnCompaniesHouse}
		<p class="text-xs text-caution">
			Companies House search needs COMPANIES_HOUSE_API_KEY on the server; until then the map shows the register only.
		</p>
	{/if}
</div>
