<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';
	import { formatPoundsAndPence } from '$lib/data/books/money';
	import type { CashflowItemRow } from '$lib/data/books/page/cashflowRows';

	let { items }: { items: CashflowItemRow[] } = $props();

	const emptyMessage =
		'No forecast items are kept yet. Your Claude adds the money the directors expect in and out through the Your Business Today connector; running billing schedules count by themselves.';

	const columns: RecordsColumn<CashflowItemRow>[] = [
		{ key: 'title', label: 'Item', sortValue: (item) => item.title },
		{ key: 'way', label: 'In or out', sortValue: (item) => item.way },
		{ key: 'amount', label: 'Amount', isFigure: true, sortValue: (item) => item.amount },
		{ key: 'repeats', label: 'How often', isWideOnly: true, sortValue: (item) => item.repeats },
		{ key: 'months', label: 'Months', isWideOnly: true },
		{ key: 'notes', label: 'Notes', isWideOnly: true }
	];
</script>

<RecordsTable label="Forecast items" {columns} rows={items} keyOf={(item) => item.id} {emptyMessage} isCardsOnPhone>
	{#snippet cells(item)}
		<RecordsCell label="Item">{item.title}</RecordsCell>
		<RecordsCell label="In or out">{item.way}</RecordsCell>
		<RecordsCell kind="figure" label="Amount">{formatPoundsAndPence(item.amount)}</RecordsCell>
		<RecordsCell label="How often" isWideOnly>{item.repeats}</RecordsCell>
		<RecordsCell label="Months" isWideOnly>{item.months}</RecordsCell>
		<RecordsCell label="Notes" isWideOnly>{item.notes}</RecordsCell>
	{/snippet}
</RecordsTable>
