<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { areaPartWord } from './domainPlainWords';
	import type { BusinessBrainAddresses } from '$lib/data/businessBrainAddresses';
	import type { DomainContextSummary } from '$lib/data/organisationDomain';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let { areas, addresses }: { areas: DomainContextSummary[]; addresses: BusinessBrainAddresses } = $props();

	const columns: RecordsColumn<DomainContextSummary>[] = [
		{ key: 'area', label: 'Area', sortValue: (area) => area.title },
		{ key: 'part', label: 'Part it plays', sortValue: (area) => areaPartWord(area.subdomain) },
		{ key: 'summary', label: 'What it holds', isWideOnly: true }
	];
</script>

<RecordsTable label="Areas" {columns} rows={areas} keyOf={(area) => area.pageId} isCardsOnPhone emptyMessage="No area has been filed yet.">
	{#snippet cells(area)}
		<RecordsCell kind="link" href={addresses.page(area.pageId)}>{area.title}</RecordsCell>
		<RecordsCell label="Part it plays">{areaPartWord(area.subdomain)}</RecordsCell>
		<RecordsCell isWideOnly label="What it holds">{area.summary}</RecordsCell>
	{/snippet}
</RecordsTable>
