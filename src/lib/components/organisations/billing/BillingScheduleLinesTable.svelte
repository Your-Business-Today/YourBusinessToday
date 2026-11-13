<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { formatPoundsAndPence } from '$lib/data/books/money';
	import type { BilledScheduleLine } from '$lib/data/books/organisationBilling';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let { title, lines }: { title: string; lines: BilledScheduleLine[] } = $props();

	const columns: RecordsColumn<BilledScheduleLine>[] = [
		{ key: 'what', label: 'What' },
		{ key: 'quantity', label: 'Quantity', isFigure: true },
		{ key: 'price', label: 'Price', isFigure: true },
		{ key: 'amount', label: 'Amount', isFigure: true }
	];
</script>

<RecordsTable label={`${title}: lines`} {columns} rows={lines} keyOf={(line) => line.id} isDense isCardsOnPhone>
	{#snippet cells(line)}
		<RecordsCell kind="link">{line.description}</RecordsCell>
		<RecordsCell kind="figure" label="Quantity">{line.quantity}</RecordsCell>
		<RecordsCell kind="figure" label="Price">{formatPoundsAndPence(line.unitPrice)}</RecordsCell>
		<RecordsCell kind="figure" label="Amount">{formatPoundsAndPence(line.amount)}</RecordsCell>
	{/snippet}
</RecordsTable>
