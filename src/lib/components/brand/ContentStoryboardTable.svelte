<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';
	import type { ShotRow } from '$lib/brand/projections/contentPiecePage';

	let { shots }: { shots: ShotRow[] } = $props();

	const columns: RecordsColumn<ShotRow>[] = [
		{ key: 'number', label: 'Shot', isFigure: true },
		{ key: 'seconds', label: 'Seconds', isFigure: true },
		{ key: 'description', label: 'What we see and hear' },
		{ key: 'onScreenText', label: 'On screen', isWideOnly: true }
	];
</script>

<div class="overflow-x-auto">
	<RecordsTable label="Storyboard" {columns} rows={shots} keyOf={(shot) => `${shot.number}`} emptyMessage="This piece has no storyboard.">
		{#snippet cells(shot)}
			<RecordsCell kind="figure">{shot.number}</RecordsCell>
			<RecordsCell kind="figure">{shot.seconds}</RecordsCell>
			<RecordsCell>{shot.description}</RecordsCell>
			<RecordsCell isWideOnly>{shot.onScreenText}</RecordsCell>
		{/snippet}
	</RecordsTable>
</div>
