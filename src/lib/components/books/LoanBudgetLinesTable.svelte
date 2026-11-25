<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';
	import { formatPoundsAndPence } from '$lib/data/books/money';
	import type { BudgetLineRow } from '$lib/data/books/page/loanBudgetRows';

	let { lines, label }: { lines: BudgetLineRow[]; label: string } = $props();

	const emptyMessage = 'No budget lines yet. Your Claude adds each line the directors agree through the Your Business Today connector, and a director approves it there.';

	const columns: RecordsColumn<BudgetLineRow>[] = [
		{ key: 'purpose', label: 'Spent on', sortValue: (line) => line.purpose },
		{ key: 'amount', label: 'Budget', isFigure: true, sortValue: (line) => line.amount },
		{ key: 'expectedReturn', label: 'Expected return', isWideOnly: true },
		{ key: 'approval', label: 'Approved by', sortValue: (line) => line.approval }
	];
</script>

<RecordsTable {label} {columns} rows={lines} keyOf={(line) => line.id} {emptyMessage} isCardsOnPhone>
	{#snippet cells(line)}
		<RecordsCell label="Spent on">{line.purpose}</RecordsCell>
		<RecordsCell kind="figure" label="Budget">{formatPoundsAndPence(line.amount)}</RecordsCell>
		<RecordsCell label="Expected return" isWideOnly>{line.expectedReturn}</RecordsCell>
		<RecordsCell label="Approved by">{line.approval}</RecordsCell>
	{/snippet}
</RecordsTable>
