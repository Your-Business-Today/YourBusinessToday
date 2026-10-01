<script lang="ts">
	import GoalStatusPill from './GoalStatusPill.svelte';
	import PriorityControls from '$lib/components/projects/PriorityControls.svelte';
	import PriorityNumberButton from '$lib/components/site/PriorityNumberButton.svelte';
	import ProgressTrack from '$lib/components/workspace/ProgressTrack.svelte';
	import ReorderableRow from '$lib/components/site/ReorderableRow.svelte';
	import { openGoalStatus } from '$lib/data/goalStatus';
	import type { GoalSummary } from '$lib/server/goals/getGoalSummaries';
	import type { ListReorder } from '$lib/client/listReorder.svelte';

	let {
		goalSummary,
		listReorder,
		isFirst,
		isLast,
		onSetPriority
	}: {
		goalSummary: GoalSummary;
		listReorder: ListReorder;
		isFirst: boolean;
		isLast: boolean;
		onSetPriority: (goalSummary: GoalSummary) => void;
	} = $props();

	const taskCountLabel = $derived(
		goalSummary.taskCount === 1 ? '1 task' : `${goalSummary.taskCount} tasks`
	);
	const isOpen = $derived(goalSummary.status === openGoalStatus);
</script>

<ReorderableRow
	{listReorder}
	rowId={goalSummary.id}
	class="group/goal flex items-center gap-1 px-2 py-2 transition hover:bg-night/40"
>
	{#snippet children(dragHandle)}
		<div class="flex shrink-0 items-center gap-0.5">
			{@render dragHandle()}
			<PriorityControls
				moveAction="?/moveGoal"
				fieldName="goalId"
				id={goalSummary.id}
				{isFirst}
				{isLast}
			/>
			<PriorityNumberButton
				label={goalSummary.priority}
				itemName={goalSummary.title}
				class="min-w-5 text-right font-display text-xs tabular-nums text-chalk/40"
				onclick={() => onSetPriority(goalSummary)}
			/>
		</div>
		<a
			href={`/projects/${goalSummary.projectId}/goals/${goalSummary.id}`}
			class="flex min-w-0 flex-1 flex-col gap-1 pl-1.5"
		>
			<span class="flex min-w-0 items-center gap-2">
				<span class="truncate font-display text-sm transition group-hover/goal:text-go">
					{goalSummary.title}
				</span>
				{#if !isOpen}
					<GoalStatusPill status={goalSummary.status} />
				{/if}
			</span>
			<ProgressTrack completionPercent={goalSummary.completionPercent} />
			<span class="flex flex-wrap gap-x-2 text-[0.7rem] text-chalk/50">
				<span>{taskCountLabel}</span>
				<span>{goalSummary.completionPercent}%</span>
				{#if goalSummary.awaitingAnswerCount > 0}
					<span class="text-signal">{goalSummary.awaitingAnswerCount} awaiting an answer</span>
				{/if}
			</span>
		</a>
	{/snippet}
</ReorderableRow>
