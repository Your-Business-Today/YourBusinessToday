<script lang="ts">
	import { companiesHouseKeyNote, describeAreaSummary } from './areaSummary';
	import type { AreaMap } from '$lib/server/clients/area/mapArea';

	let { area }: { area: AreaMap } = $props();

	const summary = $derived(describeAreaSummary(area));
</script>

<div class="flex flex-col gap-1">
	<p class="text-sm text-chalk/70">{summary}</p>
	{#if !area.isSearchedOnCompaniesHouse}
		<p class="text-xs text-caution">{companiesHouseKeyNote}</p>
	{/if}
</div>
