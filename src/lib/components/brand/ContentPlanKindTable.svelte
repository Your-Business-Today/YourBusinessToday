<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { noKindsThisMonth } from './contentPlanPageWords';
	import type { KindCount } from '$lib/brand/plan/planCounts';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let { kindCounts }: { kindCounts: KindCount[] } = $props();

	const columns: RecordsColumn<KindCount>[] = [
		{ key: 'kind', label: 'Kind', sortValue: (row) => row.kind },
		{ key: 'count', label: 'Posts', isFigure: true, sortValue: (row) => row.count }
	];
</script>

<RecordsTable
	label="Kinds of post this month"
	{columns}
	rows={kindCounts}
	keyOf={(row) => row.kind}
	emptyMessage={noKindsThisMonth}
	isDense
>
	{#snippet cells(row)}
		<RecordsCell>{row.kind}</RecordsCell>
		<RecordsCell kind="figure">{row.count}</RecordsCell>
	{/snippet}
</RecordsTable>
