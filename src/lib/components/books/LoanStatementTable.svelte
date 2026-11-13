<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import StatementFigureCell from './StatementFigureCell.svelte';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';
	import { formatBritishDate } from '$lib/data/britishDate';
	import type { LoanStatementRow } from '$lib/data/books/page/loanStatementRows';

	let { rows }: { rows: LoanStatementRow[] } = $props();

	const nothingMoved = 0;
	const emptyMessage = 'No money has gone in or out of this account yet.';

	const columns: RecordsColumn<LoanStatementRow>[] = [
		{ key: 'date', label: 'Date' },
		{ key: 'what', label: 'What' },
		{ key: 'moneyIn', label: 'In', isFigure: true },
		{ key: 'moneyOut', label: 'Out', isFigure: true },
		{ key: 'balance', label: 'Balance', isFigure: true }
	];

	const shownMovement = (amount: number) => (amount === nothingMoved ? null : amount);
</script>

<RecordsTable label="Loan statement" {columns} {rows} keyOf={(row) => row.key} {emptyMessage} isDense>
	{#snippet cells(row)}
		<RecordsCell><span class="whitespace-nowrap">{formatBritishDate(row.journalDate)}</span></RecordsCell>
		<RecordsCell>
			{row.description}
			{#if row.isOverdrawn}<Badge label="Overdrawn" tone="negative" />{/if}
		</RecordsCell>
		<StatementFigureCell amount={shownMovement(row.moneyIn)} />
		<StatementFigureCell amount={shownMovement(row.moneyOut)} />
		<StatementFigureCell amount={row.balance} />
	{/snippet}
</RecordsTable>
