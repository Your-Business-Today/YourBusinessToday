<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import StatementFigureCell from './StatementFigureCell.svelte';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';
	import { formatBritishDate } from '$lib/data/britishDate';
	import type { BankLineRow } from '$lib/data/books/page/bankLineRows';

	let { lines, emptyMessage }: { lines: BankLineRow[]; emptyMessage: string } = $props();

	const columns: RecordsColumn<BankLineRow>[] = [
		{ key: 'date', label: 'Date' },
		{ key: 'counterparty', label: 'Counterparty' },
		{ key: 'reference', label: 'Reference', isWideOnly: true },
		{ key: 'moneyIn', label: 'In', isFigure: true },
		{ key: 'moneyOut', label: 'Out', isFigure: true },
		{ key: 'balance', label: 'Balance', isFigure: true, isWideOnly: true },
		{ key: 'matchedTo', label: 'Matched to', isWideOnly: true }
	];
</script>

<RecordsTable label="Bank statement lines" {columns} rows={lines} keyOf={(line) => line.id} {emptyMessage} isDense>
	{#snippet cells(line)}
		<RecordsCell label="Date"><span class="whitespace-nowrap">{formatBritishDate(line.date)}</span></RecordsCell>
		<RecordsCell label="Counterparty">{line.counterparty}</RecordsCell>
		<RecordsCell label="Reference" isWideOnly>{line.reference}</RecordsCell>
		<StatementFigureCell amount={line.moneyIn} />
		<StatementFigureCell amount={line.moneyOut} />
		<StatementFigureCell amount={line.balance} />
		<RecordsCell label="Matched to" isWideOnly>{line.matchedTo}</RecordsCell>
	{/snippet}
</RecordsTable>
