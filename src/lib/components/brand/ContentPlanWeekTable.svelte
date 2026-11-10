<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import ContentPlanChannelLinks from './ContentPlanChannelLinks.svelte';
	import ContentPlanChannelMoves from './ContentPlanChannelMoves.svelte';
	import ContentPlanChannelStages from './ContentPlanChannelStages.svelte';
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { contentPiecePathOf } from './brandKitPageWords';
	import { noKindYet } from '$lib/brand/plan/planCounts';
	import { nothingPlanned, postDue } from './contentPlanPageWords';
	import { planRowsOf, type PlanRow } from '$lib/brand/plan/planRows';
	import type { PlanEntry, PlanWeek } from '$lib/brand/plan/contentPlan';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let { organisationId, week, onMove }: { organisationId: string; week: PlanWeek; onMove: (entry: PlanEntry) => void } =
		$props();

	const blank = '';
	const rows = $derived(planRowsOf(week));
	const columns: RecordsColumn<PlanRow>[] = [
		{ key: 'day', label: 'Goes live' },
		{ key: 'time', label: 'Time' },
		{ key: 'medium', label: 'Channels' },
		{ key: 'kind', label: 'Kind' },
		{ key: 'title', label: 'Idea' },
		{ key: 'hook', label: 'Opening line', isWideOnly: true },
		{ key: 'stage', label: 'Status' },
		{ key: 'move', label: '' }
	];
</script>

<div class="overflow-x-auto">
	<RecordsTable label={week.label} {columns} {rows} keyOf={(row) => row.key} isDense>
		{#snippet cells(row)}
			<RecordsCell kind="status">{row.dayLabel}</RecordsCell>
			{#if row.post === null}
				<RecordsCell>{blank}</RecordsCell>
				<RecordsCell>{blank}</RecordsCell>
				<RecordsCell>{blank}</RecordsCell>
				{#if row.dueFor === null}
					<RecordsCell><span class="text-chalk-subtle">{nothingPlanned}</span></RecordsCell>
				{:else}
					<RecordsCell><Badge label={postDue} tone="warning" hasDot /> {row.dueFor}</RecordsCell>
				{/if}
				<RecordsCell isWideOnly>{blank}</RecordsCell>
				<RecordsCell>{blank}</RecordsCell>
				<RecordsCell>{blank}</RecordsCell>
			{:else}
				{@const post = row.post}
				{@const [firstChannel] = post.channels}
				<RecordsCell kind="status">{post.time}</RecordsCell>
				<RecordsCell><ContentPlanChannelLinks {organisationId} channels={post.channels} /></RecordsCell>
				<RecordsCell>{post.kind ?? noKindYet}</RecordsCell>
				<RecordsCell kind="link" href={contentPiecePathOf(organisationId, firstChannel.id)}>{post.title}</RecordsCell>
				<RecordsCell isWideOnly>{post.hook}</RecordsCell>
				<RecordsCell kind="status"><ContentPlanChannelStages channels={post.channels} /></RecordsCell>
				<RecordsCell kind="actions"><ContentPlanChannelMoves channels={post.channels} {onMove} /></RecordsCell>
			{/if}
		{/snippet}
	</RecordsTable>
</div>
