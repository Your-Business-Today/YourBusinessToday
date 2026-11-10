<script lang="ts">
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import StatementFigureCell from './StatementFigureCell.svelte';
	import { formatBritishDate } from '$lib/data/britishDate';
	import type { AccountEntryRow } from '$lib/data/books/page/accountEntryRows';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let { rows, closingBalance }: { rows: AccountEntryRow[]; closingBalance: number } = $props();

	const columns: RecordsColumn<AccountEntryRow>[] = [
		{ key: 'date', label: 'Date' },
		{ key: 'description', label: 'Description' },
		{ key: 'kind', label: 'Posted by', isWideOnly: true },
		{ key: 'debit', label: 'Debit', isFigure: true },
		{ key: 'credit', label: 'Credit', isFigure: true },
		{ key: 'balance', label: 'Balance', isFigure: true }
	];
</script>

<RecordsTable label="Entries" {columns} {rows} keyOf={(row) => row.key} isDense emptyMessage="No entries in these days.">
	{#snippet cells(row)}
		<RecordsCell><span class="whitespace-nowrap">{formatBritishDate(row.journalDate)}</span></RecordsCell>
		<RecordsCell>{row.description}</RecordsCell>
		<RecordsCell isWideOnly>{row.kindLabel}</RecordsCell>
		<StatementFigureCell amount={row.debit} />
		<StatementFigureCell amount={row.credit} />
		<StatementFigureCell amount={row.balance} />
	{/snippet}
	{#snippet totals()}
		<RecordsCell>Closing balance</RecordsCell>
		<RecordsCell>{''}</RecordsCell>
		<RecordsCell isWideOnly>{''}</RecordsCell>
		<RecordsCell>{''}</RecordsCell>
		<RecordsCell>{''}</RecordsCell>
		<StatementFigureCell amount={closingBalance} isTotal />
	{/snippet}
</RecordsTable>
