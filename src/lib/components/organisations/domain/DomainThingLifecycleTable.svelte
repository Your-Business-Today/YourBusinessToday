<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { workflowMapStationHref } from '$lib/components/organisations/organisationPages';
	import type { DomainLifecycleRow } from '$lib/data/domainLifecycleRows';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let { rows, organisationId }: { rows: DomainLifecycleRow[]; organisationId: string } = $props();

	const listSeparator = ', ';

	const columns: RecordsColumn<DomainLifecycleRow>[] = [
		{ key: 'status', label: 'Status' },
		{ key: 'meaning', label: 'Meaning' },
		{ key: 'movesTo', label: 'Moves to' },
		{ key: 'reachedBy', label: 'Reached by', isWideOnly: true }
	];
</script>

<RecordsTable label="Lifecycle" {columns} {rows} keyOf={(row) => row.status} isDense isCardsOnPhone emptyMessage="No statuses are filed for it.">
	{#snippet cells(row)}
		<RecordsCell kind="link">{row.status}</RecordsCell>
		<RecordsCell label="Meaning">{row.meaning}</RecordsCell>
		<RecordsCell label="Moves to">{row.movesTo.join(listSeparator)}</RecordsCell>
		<RecordsCell isWideOnly label="Reached by">
			{#each row.reachedBy as station, index (station.stationKey)}
				{#if index > 0}{listSeparator}{/if}<a href={workflowMapStationHref(organisationId, station.stationKey)} class="hover:underline">{station.stationName}</a>
			{/each}
		</RecordsCell>
	{/snippet}
</RecordsTable>
