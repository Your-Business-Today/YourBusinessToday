<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';
	import { formatBritishDate } from '$lib/data/britishDate';
	import { formatPoundsAndPence } from '$lib/data/books/money';
	import type { CostRow } from '$lib/data/books/page/costRows';

	let { costs, emptyMessage }: { costs: CostRow[]; emptyMessage: string } = $props();

	const notPaid = '';

	const columns: RecordsColumn<CostRow>[] = [
		{ key: 'date', label: 'Date', sortValue: (cost) => cost.date },
		{ key: 'supplier', label: 'Supplier', sortValue: (cost) => cost.supplier },
		{ key: 'what', label: 'What', isWideOnly: true },
		{ key: 'account', label: 'Account', isWideOnly: true, sortValue: (cost) => cost.account },
		{ key: 'amount', label: 'Amount', isFigure: true, sortValue: (cost) => cost.amount },
		{ key: 'paidOn', label: 'Paid on', sortValue: (cost) => cost.paidOn ?? notPaid }
	];
</script>

<RecordsTable label="Costs" {columns} rows={costs} keyOf={(cost) => cost.id} {emptyMessage} isCardsOnPhone>
	{#snippet cells(cost)}
		<RecordsCell label="Date">{formatBritishDate(cost.date)}</RecordsCell>
		<RecordsCell kind="link" label="Supplier">{cost.supplier}</RecordsCell>
		<RecordsCell label="What" isWideOnly>{cost.what}</RecordsCell>
		<RecordsCell label="Account" isWideOnly>{cost.account}</RecordsCell>
		<RecordsCell kind="figure" label="Amount">{formatPoundsAndPence(cost.amount)}</RecordsCell>
		<RecordsCell label="Paid on">{cost.paidOn === null ? notPaid : formatBritishDate(cost.paidOn)}</RecordsCell>
	{/snippet}
</RecordsTable>
