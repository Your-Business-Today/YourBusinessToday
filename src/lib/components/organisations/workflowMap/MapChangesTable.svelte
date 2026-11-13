<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import type { MapChange } from './workflowMapChanges';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let { changes, emptyMessage }: { changes: MapChange[]; emptyMessage: string } = $props();

	const columns: RecordsColumn<MapChange>[] = [
		{ key: 'what', label: 'What changes', sortValue: (change) => change.what },
		{ key: 'kind', label: 'Kind', sortValue: (change) => change.kind },
		{ key: 'role', label: 'Role', sortValue: (change) => change.role },
		{ key: 'before', label: 'Before' },
		{ key: 'after', label: 'After', sortValue: (change) => change.after }
	];
</script>

<RecordsTable label="What changes from the Before to the After" {columns} rows={changes} keyOf={(change) => change.key} isCardsOnPhone {emptyMessage}>
	{#snippet cells(change)}
		<RecordsCell>{change.what}</RecordsCell>
		<RecordsCell label="Kind">{change.kind}</RecordsCell>
		<RecordsCell label="Role">{change.role}</RecordsCell>
		<RecordsCell label="Before">{change.before}</RecordsCell>
		<RecordsCell label="After">{change.after}</RecordsCell>
	{/snippet}
</RecordsTable>
