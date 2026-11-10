<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { anyDay, anyTime, noRhythmYet } from './contentPlanPageWords';
	import type { PostingRhythm } from '$lib/brand/rhythm/postingRhythm';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let { rhythms }: { rhythms: PostingRhythm[] } = $props();

	const columns: RecordsColumn<PostingRhythm>[] = [
		{ key: 'medium', label: 'Post on' },
		{ key: 'days', label: 'Days' },
		{ key: 'time', label: 'Time' },
		{ key: 'postsAWeek', label: 'Posts a week', isFigure: true }
	];
</script>

<RecordsTable label="Posting rhythm" {columns} rows={rhythms} keyOf={(row) => row.mediumPath} emptyMessage={noRhythmYet} isDense>
	{#snippet cells(row)}
		<RecordsCell>{row.medium}</RecordsCell>
		<RecordsCell>{row.days?.join(', ') ?? anyDay}</RecordsCell>
		<RecordsCell kind="status">{row.time ?? anyTime}</RecordsCell>
		<RecordsCell kind="figure">{row.postsAWeek}</RecordsCell>
	{/snippet}
</RecordsTable>
