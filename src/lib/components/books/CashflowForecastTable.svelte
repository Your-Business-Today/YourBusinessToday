<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';
	import { formatPoundsAndPence } from '$lib/data/books/money';
	import type { ForecastMonthRow } from '$lib/data/books/page/cashflowRows';

	let { months }: { months: ForecastMonthRow[] } = $props();

	const emptyMessage = 'No months to forecast.';

	const columns: RecordsColumn<ForecastMonthRow>[] = [
		{ key: 'month', label: 'Month', sortValue: (row) => row.month },
		{ key: 'moneyIn', label: 'Money in', isFigure: true, sortValue: (row) => row.moneyIn },
		{ key: 'moneyOut', label: 'Money out', isFigure: true, sortValue: (row) => row.moneyOut },
		{ key: 'net', label: 'Net', isFigure: true, isWideOnly: true, sortValue: (row) => row.net },
		{ key: 'closingBalance', label: 'Cash at the end', isFigure: true, sortValue: (row) => row.closingBalance }
	];
</script>

<RecordsTable label="Twelve-month forecast" {columns} rows={months} keyOf={(row) => row.month} {emptyMessage} isCardsOnPhone>
	{#snippet cells(row)}
		<RecordsCell label="Month">{row.monthInWords}</RecordsCell>
		<RecordsCell kind="figure" label="Money in">{formatPoundsAndPence(row.moneyIn)}</RecordsCell>
		<RecordsCell kind="figure" label="Money out">{formatPoundsAndPence(row.moneyOut)}</RecordsCell>
		<RecordsCell kind="figure" label="Net" isWideOnly>{formatPoundsAndPence(row.net)}</RecordsCell>
		<RecordsCell kind="figure" label="Cash at the end">{formatPoundsAndPence(row.closingBalance)}</RecordsCell>
	{/snippet}
</RecordsTable>
