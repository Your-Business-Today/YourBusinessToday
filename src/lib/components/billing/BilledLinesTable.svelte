<script lang="ts">
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';
	import { formatPoundsAndPence } from '$lib/data/books/money';
	import type { BilledInvoice, BilledLine } from '$lib/data/billing/billedInvoice';

	let { invoice }: { invoice: BilledInvoice } = $props();

	const columns: RecordsColumn<BilledLine>[] = [
		{ key: 'description', label: 'Description' },
		{ key: 'quantity', label: 'Quantity', isFigure: true, isWideOnly: true },
		{ key: 'unitPrice', label: 'Unit price', isFigure: true, isWideOnly: true },
		{ key: 'amount', label: 'Amount', isFigure: true }
	];
</script>

<div class="overflow-x-auto">
	<RecordsTable label={`Lines of invoice ${invoice.printedNumber}`} {columns} rows={invoice.lines} keyOf={(line) => line.id}>
		{#snippet cells(line)}
			<RecordsCell>{line.description}</RecordsCell>
			<RecordsCell kind="figure" isWideOnly>{line.quantity}</RecordsCell>
			<RecordsCell kind="figure" isWideOnly>{formatPoundsAndPence(line.unitPrice)}</RecordsCell>
			<RecordsCell kind="figure">{formatPoundsAndPence(line.amount)}</RecordsCell>
		{/snippet}
		{#snippet totals()}
			<RecordsCell>Total</RecordsCell>
			<RecordsCell kind="figure" isWideOnly>{''}</RecordsCell>
			<RecordsCell kind="figure" isWideOnly>{''}</RecordsCell>
			<RecordsCell kind="figure">{formatPoundsAndPence(invoice.total)}</RecordsCell>
		{/snippet}
	</RecordsTable>
</div>
