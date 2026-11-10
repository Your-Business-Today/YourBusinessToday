<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import Button from '$lib/components/site/Button.svelte';
	import ContentStageBadge from './ContentStageBadge.svelte';
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { contentPiecePathOf } from './brandKitPageWords';
	import { noKindYet } from '$lib/brand/plan/planCounts';
	import { channelListClasses, extraPost, moveLabelOf, nothingPlanned, postDue } from './contentPlanPageWords';
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
				<RecordsCell>
					<ul class={channelListClasses}>
						{#each post.channels as channel (channel.id)}
							<li><a href={contentPiecePathOf(organisationId, channel.id)} class="hover:underline">{channel.medium}</a></li>
						{/each}
					</ul>
				</RecordsCell>
				<RecordsCell>{post.kind ?? noKindYet}</RecordsCell>
				<RecordsCell kind="link" href={contentPiecePathOf(organisationId, firstChannel.id)}>{post.title}</RecordsCell>
				<RecordsCell isWideOnly>{post.hook}</RecordsCell>
				<RecordsCell kind="status">
					<ul class={channelListClasses}>
						{#each post.channels as channel (channel.id)}
							<li>
								<ContentStageBadge stage={channel.stage} />
								{#if channel.isExtra}<Badge label={extraPost} />{/if}
							</li>
						{/each}
					</ul>
				</RecordsCell>
				<RecordsCell kind="actions">
					<ul class={channelListClasses}>
						{#each post.channels as channel (channel.id)}
							<li>
								{#if channel.canMove}<Button onclick={() => onMove(channel)}>{moveLabelOf(channel, post)}</Button>{/if}
							</li>
						{/each}
					</ul>
				</RecordsCell>
			{/if}
		{/snippet}
	</RecordsTable>
</div>
