<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	type ExampleRow = { position: number; example: string };

	let { examples }: { examples: string[] } = $props();

	const columns: RecordsColumn<ExampleRow>[] = [{ key: 'example', label: 'Example' }];
	const rows = $derived(examples.map((example, position) => ({ position, example })));
</script>

<RecordsTable
	label="Examples"
	{columns}
	{rows}
	keyOf={(row) => String(row.position)}
	isDense
	emptyMessage="Its page gives no examples yet."
>
	{#snippet cells(row)}
		<RecordsCell>{row.example}</RecordsCell>
	{/snippet}
</RecordsTable>
