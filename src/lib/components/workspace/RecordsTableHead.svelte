<script lang="ts" generics="Row">
	import { headerCellClasses, wideOnlyCellClasses, checkboxClasses } from './recordsTableStyles';
	import { isBoxTicked, sortDirections, type RecordsColumn, type RecordsSort, type SortDirection } from './recordsTable';

	let {
		columns,
		sort,
		isSelectable,
		isEverythingSelected,
		onSort,
		onSelectEverything
	}: {
		columns: RecordsColumn<Row>[];
		sort: RecordsSort | null;
		isSelectable: boolean;
		isEverythingSelected: boolean;
		onSort: (key: string) => void;
		onSelectEverything: (isSelected: boolean) => void;
	} = $props();

	const sortArrows = { ascending: '↑', descending: '↓' };
</script>

{#snippet sortButton(column: RecordsColumn<Row>, direction: SortDirection | undefined)}
	<button type="button" onclick={() => onSort(column.key)} class="inline-flex items-center gap-1 hover:underline">
		{column.label}
		<span aria-hidden="true" class={direction === undefined ? 'text-chalk-faint' : ''}>
			{sortArrows[direction ?? sortDirections.ascending]}
		</span>
	</button>
{/snippet}

<thead>
	<tr>
		{#if isSelectable}
			<th class={`${headerCellClasses} w-4`}>
				<input
					type="checkbox"
					aria-label="Select every row"
					checked={isEverythingSelected}
					onchange={(event) => onSelectEverything(isBoxTicked(event))}
					class={checkboxClasses}
				/>
			</th>
		{/if}
		{#each columns as column (column.key)}
			{@const isSorted = sort?.key === column.key}
			{@const direction = isSorted ? sort?.direction : undefined}
			<th
				scope="col"
				aria-sort={direction ?? 'none'}
				class={[headerCellClasses, column.isFigure && 'text-right', column.isWideOnly && wideOnlyCellClasses]}
			>
				{#if column.sortValue === undefined}
					{column.label}
				{:else}
					{@render sortButton(column, direction)}
				{/if}
			</th>
		{/each}
	</tr>
</thead>
