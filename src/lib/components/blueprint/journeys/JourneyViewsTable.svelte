<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import ViewJourneyMarks from './ViewJourneyMarks.svelte';
	import ViewReachedFrom from './ViewReachedFrom.svelte';
	import { journeySiteMapMessages } from './journeySiteMapWords';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';
	import type { ViewRow } from './journeyViewRows';

	let { rows, hrefOf }: { rows: ViewRow[]; hrefOf: (row: ViewRow) => string } = $props();

	const columns: RecordsColumn<ViewRow>[] = [
		{ key: 'view', label: 'View', sortValue: (row) => row.name },
		{ key: 'route', label: 'Route', sortValue: (row) => row.route },
		{ key: 'journeys', label: 'Journeys' },
		{ key: 'reachedFrom', label: 'Reached from' }
	];
</script>

<RecordsTable label="Every view" {columns} {rows} keyOf={(row) => row.route} {hrefOf} isCardsOnPhone emptyMessage={journeySiteMapMessages.noViews}>
	{#snippet cells(row)}
		<RecordsCell>{row.name}</RecordsCell>
		<RecordsCell label="Route"><code class="font-mono text-xs text-chalk-muted">{row.route}</code></RecordsCell>
		<RecordsCell label="Journeys"><ViewJourneyMarks journeys={row.journeys} /></RecordsCell>
		<RecordsCell label="Reached from"><ViewReachedFrom {row} /></RecordsCell>
	{/snippet}
</RecordsTable>
