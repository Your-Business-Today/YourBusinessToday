<script lang="ts">
	import { businessTypes } from '$lib/data/businessTypes';
	import { narrowedSearchQuery, type AreaSearch } from '$lib/data/areaSearch';
	import { quietButtonClasses } from '$lib/components/site/formStyles';
	import type { AreaMap } from '$lib/server/clients/area/mapArea';

	let { area, search }: { area: AreaMap; search: AreaSearch } = $props();

	const companyCount = $derived(area.companiesHouseHits.toLocaleString('en-GB'));
</script>

<section class="flex flex-col gap-3 rounded-2xl border border-caution/50 bg-caution/10 p-5">
	<p class="text-sm text-caution">
		About {companyCount} companies are registered within {search.radiusMiles} miles of {search.postcode}. That is too many to go
		through, so only the nearest are shown. Which type of business are you after?
	</p>
	<div class="flex flex-wrap gap-2">
		{#each businessTypes as type (type.key)}
			<a href={`?${narrowedSearchQuery(search, type.key)}`} class={quietButtonClasses}>{type.name}</a>
		{/each}
	</div>
</section>
