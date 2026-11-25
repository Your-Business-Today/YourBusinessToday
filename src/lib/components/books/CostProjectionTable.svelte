<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';
	import { formatPoundsAndPence } from '$lib/data/books/money';
	import type { CostProjectionRow } from '$lib/data/books/page/costProjectionRows';

	let { projections, byMonthInWords }: { projections: CostProjectionRow[]; byMonthInWords: string } = $props();

	const emptyMessage =
		'No cost centres are kept yet. Your Claude keeps one for each project, and keeps its costs and forecast items against it, through the Your Business Today connector.';

	const byLabel = $derived(`by ${byMonthInWords}`);
	const columns: RecordsColumn<CostProjectionRow>[] = $derived([
		{ key: 'label', label: 'Project', sortValue: (row) => row.label },
		{ key: 'costsSoFar', label: 'Cost so far', isFigure: true, sortValue: (row) => row.costsSoFar },
		{ key: 'incomeSoFar', label: 'Earned so far', isFigure: true, isWideOnly: true, sortValue: (row) => row.incomeSoFar },
		{ key: 'costsBy', label: `Cost ${byLabel}`, isFigure: true, sortValue: (row) => row.costsBy },
		{ key: 'incomeBy', label: `Earned ${byLabel}`, isFigure: true, isWideOnly: true, sortValue: (row) => row.incomeBy },
		{ key: 'netBy', label: `Net ${byLabel}`, isFigure: true, sortValue: (row) => row.netBy }
	]);
</script>

<RecordsTable label="Project costs" {columns} rows={projections} keyOf={(row) => row.id} {emptyMessage} isCardsOnPhone>
	{#snippet cells(row)}
		<RecordsCell label="Project">{row.label}</RecordsCell>
		<RecordsCell kind="figure" label="Cost so far">{formatPoundsAndPence(row.costsSoFar)}</RecordsCell>
		<RecordsCell kind="figure" label="Earned so far" isWideOnly>{formatPoundsAndPence(row.incomeSoFar)}</RecordsCell>
		<RecordsCell kind="figure" label="Cost {byLabel}">{formatPoundsAndPence(row.costsBy)}</RecordsCell>
		<RecordsCell kind="figure" label="Earned {byLabel}" isWideOnly>{formatPoundsAndPence(row.incomeBy)}</RecordsCell>
		<RecordsCell kind="figure" label="Net {byLabel}">{formatPoundsAndPence(row.netBy)}</RecordsCell>
	{/snippet}
</RecordsTable>
