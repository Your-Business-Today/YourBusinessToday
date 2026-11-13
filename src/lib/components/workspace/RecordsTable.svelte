<script lang="ts" generics="Row">
	import type { Snippet } from 'svelte';
	import BrandSpinner from '$lib/components/site/BrandSpinner.svelte';
	import RecordsTableHead from './RecordsTableHead.svelte';
	import { rowLink } from '$lib/client/rowLink';
	import { isBoxTicked, rowsInOrder, rowTargetOf, sortAfterPress, type RecordsColumn, type RecordsSort } from './recordsTable';
	import { bodySectionClasses, checkboxClasses, clickableRowClasses, rowClasses, selectedRowClasses, tableClasses } from './recordsTableStyles';

	let {
		label,
		columns,
		rows,
		keyOf,
		hrefOf,
		onOpen,
		isDense = false,
		isCardsOnPhone = false,
		isLoading = false,
		emptyMessage = 'Nothing here yet.',
		selectedKeys = $bindable(),
		cells,
		subRows,
		totals
	}: {
		label: string;
		columns: RecordsColumn<Row>[];
		rows: Row[];
		keyOf: (row: Row) => string;
		hrefOf?: (row: Row) => string;
		onOpen?: (row: Row) => void;
		isDense?: boolean;
		isCardsOnPhone?: boolean;
		isLoading?: boolean;
		emptyMessage?: string;
		selectedKeys?: string[];
		cells: Snippet<[Row]>;
		subRows?: Snippet<[Row]>;
		totals?: Snippet;
	} = $props();

	let sort: RecordsSort | null = $state(null);
	const shownRows = $derived(rowsInOrder(rows, columns, sort));
	const isSelectable = $derived(selectedKeys !== undefined);
	const columnCount = $derived(columns.length + (isSelectable ? 1 : 0));
	const isEverythingSelected = $derived(rows.length > 0 && selectedKeys?.length === rows.length);

	function selectEverything(isSelected: boolean) {
		selectedKeys = isSelected ? rows.map(keyOf) : [];
	}

	function selectRow(key: string, isSelected: boolean) {
		const others = (selectedKeys ?? []).filter((selectedKey) => selectedKey !== key);
		selectedKeys = isSelected ? [...others, key] : others;
	}
</script>

{#snippet rowContent(row: Row, key: string, isSelected: boolean)}
	{#if isSelectable}
		<td class="px-4 align-middle md:px-6">
			<input
				type="checkbox"
				aria-label="Select this row"
				checked={isSelected}
				onchange={(event) => selectRow(key, isBoxTicked(event))}
				class={checkboxClasses}
			/>
		</td>
	{/if}
	{@render cells(row)}
{/snippet}

<table aria-label={label} data-dense={isDense} data-cards={isCardsOnPhone} class={tableClasses}>
	<RecordsTableHead {columns} {sort} {isSelectable} {isEverythingSelected} onSort={(key) => (sort = sortAfterPress(sort, key))} onSelectEverything={selectEverything} />
	<tbody class={bodySectionClasses}>
		{#if isLoading}
			<tr><td colspan={columnCount} class="py-6"><div class="flex justify-center"><BrandSpinner size={32} /></div></td></tr>
		{:else if shownRows.length === 0}
			<tr><td colspan={columnCount} class="px-6 py-12 text-center text-chalk-subtle">{emptyMessage}</td></tr>
		{/if}
		{#each isLoading ? [] : shownRows as row (keyOf(row))}
			{@const key = keyOf(row)}
			{@const isSelected = selectedKeys?.includes(key) ?? false}
			{@const classes = [rowClasses, isSelected && selectedRowClasses]}
			{@const target = rowTargetOf(row, hrefOf, onOpen)}
			{#if target === undefined}
				<tr class={classes}>{@render rowContent(row, key, isSelected)}</tr>
			{:else}
				<tr use:rowLink={target} class={[classes, clickableRowClasses]}>{@render rowContent(row, key, isSelected)}</tr>
			{/if}
			{@render subRows?.(row)}
		{/each}
	</tbody>
	{#if totals !== undefined}
		<tfoot class="border-t border-hairline-strong bg-night font-semibold [&_td]:text-chalk">
			<tr>{@render totals()}</tr>
		</tfoot>
	{/if}
</table>
