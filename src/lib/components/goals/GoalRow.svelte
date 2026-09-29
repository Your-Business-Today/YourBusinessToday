<script lang="ts">
	import CompletionBar from '$lib/components/projects/CompletionBar.svelte';
	import GoalStatusPill from './GoalStatusPill.svelte';
	import PriorityControls from '$lib/components/projects/PriorityControls.svelte';
	import PriorityNumberButton from '$lib/components/site/PriorityNumberButton.svelte';
	import ReorderableRow from '$lib/components/site/ReorderableRow.svelte';
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
</script>

<ReorderableRow
	{listReorder}
	rowId={goalSummary.id}
	class="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl py-1"
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
				class="min-w-6 text-right font-display text-sm text-chalk/40"
				onclick={() => onSetPriority(goalSummary)}
			/>
		</div>
		<a
			href={`/projects/${goalSummary.projectId}/goals/${goalSummary.id}`}
			class="w-full truncate font-display text-sm transition hover:text-go sm:w-64"
		>
			{goalSummary.title}
		</a>
		<span class="w-16 text-xs whitespace-nowrap text-chalk/50">{taskCountLabel}</span>
		<div class="min-w-40 flex-1">
			<CompletionBar completionPercent={goalSummary.completionPercent} />
		</div>
		{#if goalSummary.awaitingAnswerCount > 0}
			<span class="text-xs whitespace-nowrap text-signal">
				{goalSummary.awaitingAnswerCount} awaiting an answer
			</span>
		{/if}
		<GoalStatusPill status={goalSummary.status} />
	{/snippet}
</ReorderableRow>
