<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';
	import ContentStageBadge from './ContentStageBadge.svelte';
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { contentPiecePathOf } from './brandKitPageWords';
	import { nothingPlanned } from './contentPlanPageWords';
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
		{ key: 'medium', label: 'Post on' },
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
			{#if row.entry === null}
				<RecordsCell>{blank}</RecordsCell>
				<RecordsCell>{blank}</RecordsCell>
				<RecordsCell><span class="text-chalk-subtle">{nothingPlanned}</span></RecordsCell>
				<RecordsCell isWideOnly>{blank}</RecordsCell>
				<RecordsCell>{blank}</RecordsCell>
				<RecordsCell>{blank}</RecordsCell>
			{:else}
				{@const entry = row.entry}
				<RecordsCell kind="status">{entry.time}</RecordsCell>
				<RecordsCell>{entry.medium}</RecordsCell>
				<RecordsCell kind="link" href={contentPiecePathOf(organisationId, entry.id)}>{entry.title}</RecordsCell>
				<RecordsCell isWideOnly>{entry.hook}</RecordsCell>
				<RecordsCell kind="status"><ContentStageBadge stage={entry.stage} /></RecordsCell>
				{#if entry.canMove}
					<RecordsCell kind="actions"><Button onclick={() => onMove(entry)}>Move</Button></RecordsCell>
				{:else}
					<RecordsCell>{blank}</RecordsCell>
				{/if}
			{/if}
		{/snippet}
	</RecordsTable>
</div>
