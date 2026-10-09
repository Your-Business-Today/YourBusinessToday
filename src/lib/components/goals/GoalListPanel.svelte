<script lang="ts">
	import AddGoalForm from './AddGoalForm.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import GoalRow from './GoalRow.svelte';
	import GoalStatusFilter from './GoalStatusFilter.svelte';
	import { openGoalsOnly } from './goalStatusFilters';
	import {
		goalHorizonLabels,
		goalPriorityScope,
		goalsOnHorizon,
		currentGoalHorizon,
		type GoalHorizon
	} from '$lib/data/goalHorizon';
	import Modal from '$lib/components/site/Modal.svelte';
	import PriorityModal from '$lib/components/site/PriorityModal.svelte';
	import { ListReorder } from '$lib/client/listReorder.svelte';
	import { panelButtonClasses, panelEmptyClasses, panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import { postListReorder } from '$lib/client/postListReorder';
	import type { GoalSummary } from '$lib/server/goals/summariseGoals';

	let { goalSummaries, horizon }: { goalSummaries: GoalSummary[]; horizon: GoalHorizon } = $props();

	let isAddGoalModalOpen = $state(false);
	let isPriorityModalOpen = $state(false);
	let priorityGoal = $state<GoalSummary | null>(null);
	let shouldIncludeClosed = $state(false);

	const listReorder = new ListReorder((movedGoalId, targetGoalId, placement) =>
		postListReorder('?/placeGoal', { movedGoalId, targetGoalId, placement })
	);

	const goalsOnThisHorizon = $derived(goalsOnHorizon(goalSummaries, horizon));
	const shownGoalSummaries = $derived(
		shouldIncludeClosed ? goalsOnThisHorizon : openGoalsOnly(goalsOnThisHorizon)
	);
	const panelTitle = $derived(`${goalHorizonLabels[horizon]} goals`);
	const emptyMessage = $derived(
		horizon === currentGoalHorizon
			? 'No current goals yet — a goal is what the project must achieve, with a measure both sides can check.'
			: 'No long term goals yet — the work that is not going to be done yet goes under one, out of the numbers.'
	);

	function openPriorityModal(goalSummary: GoalSummary) {
		priorityGoal = goalSummary;
		isPriorityModalOpen = true;
	}
</script>

<DashboardPanel title={panelTitle} count={shownGoalSummaries.length}>
	{#snippet actions()}
		<GoalStatusFilter bind:shouldIncludeClosed />
		<button type="button" onclick={() => (isAddGoalModalOpen = true)} class={panelButtonClasses}>
			＋ Goal
		</button>
	{/snippet}
	{#if goalsOnThisHorizon.length === 0}
		<p class={panelEmptyClasses}>{emptyMessage}</p>
	{:else if shownGoalSummaries.length === 0}
		<p class={panelEmptyClasses}>
			No open goals — press All to see the goals that are met or dropped.
		</p>
	{:else}
		<ul class={panelListClasses}>
			{#each shownGoalSummaries as goalSummary, goalIndex (goalSummary.id)}
				<GoalRow
					{goalSummary}
					{listReorder}
					isFirst={goalIndex === 0}
					isLast={goalIndex === shownGoalSummaries.length - 1}
					onSetPriority={openPriorityModal}
				/>
			{/each}
		</ul>
	{/if}
</DashboardPanel>

<Modal title={`Add ${goalHorizonLabels[horizon].toLowerCase()} goal`} bind:isOpen={isAddGoalModalOpen}>
	<AddGoalForm {horizon} onCreated={() => (isAddGoalModalOpen = false)} />
</Modal>

{#if priorityGoal !== null}
	<PriorityModal
		itemName={priorityGoal.title}
		priority={priorityGoal.priority}
		among={goalPriorityScope(horizon)}
		action="?/setGoalPriority"
		fields={{ goalId: priorityGoal.id }}
		bind:isOpen={isPriorityModalOpen}
	/>
{/if}
