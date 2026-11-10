<script lang="ts">
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import StatementFigureCell from './StatementFigureCell.svelte';
	import { StatementRowWeights, type StatementRow } from '$lib/data/books/page/statementRows';
	import type { BooksStatement } from '$lib/data/books/page/booksStatements';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let { statement }: { statement: BooksStatement } = $props();

	const accountColumn: RecordsColumn<StatementRow> = { key: 'account', label: 'Account' };
	const columns = $derived([
		accountColumn,
		...statement.figureLabels.map((label) => ({ key: label, label, isFigure: true }))
	]);
	const weightClasses = {
		[StatementRowWeights.heading]: 'font-display font-semibold text-chalk',
		[StatementRowWeights.line]: '',
		[StatementRowWeights.total]: 'font-semibold text-chalk'
	};
</script>

<RecordsTable label={statement.title} {columns} rows={statement.rows} keyOf={(row) => row.key} isDense>
	{#snippet cells(row)}
		<RecordsCell kind={row.href === null ? 'text' : 'link'} href={row.href ?? undefined}>
			<span class={weightClasses[row.weight]}>{row.label}</span>
		</RecordsCell>
		{#each statement.figureLabels as label, position (label)}
			{@const figure = row.figures[position]}
			<StatementFigureCell amount={figure?.amount ?? null} href={figure?.href} isTotal={row.weight === StatementRowWeights.total} />
		{/each}
	{/snippet}
</RecordsTable>
