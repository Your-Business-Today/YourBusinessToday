<script lang="ts">
	import SectorClaimForms from './SectorClaimForms.svelte';
	import SectorSearchForm from './SectorSearchForm.svelte';
	import SectorSearchRow from './SectorSearchRow.svelte';
	import { coverageStateLabels, type SectorCoverage } from '$lib/data/sectorCoverage';
	import type { PostcodeSector } from '$lib/server/sectors/postcodeSectorRecord';
	import type { RecordedSectorSearch } from '$lib/server/sectors/sectorSearchRecord';

	let {
		patchId,
		sector,
		coverage,
		searches,
		companyCount,
		accountNames,
		actionPrefix = '?/'
	}: {
		patchId: string;
		sector: PostcodeSector;
		coverage: SectorCoverage;
		searches: RecordedSectorSearch[];
		companyCount: number;
		accountNames: Record<string, string>;
		actionPrefix?: string;
	} = $props();

	const holderName = $derived(coverage.claimedByAccountId === null ? null : (accountNames[coverage.claimedByAccountId] ?? 'a colleague'));
	const standing = $derived(holderName === null ? coverageStateLabels[coverage.state] : `Claimed by ${holderName}`);
</script>

<aside class="flex flex-col gap-4 rounded-2xl border border-hairline bg-carriage p-5">
	<div class="flex flex-col gap-1">
		<h2 class="font-display text-xl font-medium">
			<a href={`/clients/patches/${patchId}/sectors/${encodeURIComponent(sector.sector)}`} class="hover:text-signal">{sector.sector}</a>
		</h2>
		<p class="text-sm text-chalk/70">{standing} · {sector.unitPostcodeCount} postcodes · {companyCount} companies registered here</p>
	</div>
	<SectorClaimForms {patchId} sector={sector.sector} isClaimed={coverage.claimedByAccountId !== null} {actionPrefix} />
	<SectorSearchForm {patchId} sector={sector.sector} action={`${actionPrefix}markSearched`} />
	{#if searches.length > 0}
		<ul class="divide-y divide-hairline">
			{#each searches as search (search.id)}
				<SectorSearchRow {search} searcherName={accountNames[search.searchedByAccountId] ?? 'Former account'} />
			{/each}
		</ul>
	{/if}
</aside>
