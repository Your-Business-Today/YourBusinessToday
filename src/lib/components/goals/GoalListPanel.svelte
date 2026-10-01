<script lang="ts">
	import AddGoalForm from './AddGoalForm.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import GoalRow from './GoalRow.svelte';
	import GoalStatusFilter from './GoalStatusFilter.svelte';
	import { openGoalsOnly } from './goalStatusFilters';
	import Modal from '$lib/components/site/Modal.svelte';
	import PriorityModal from '$lib/components/site/PriorityModal.svelte';
	import { ListReorder } from '$lib/client/listReorder.svelte';
	import { panelButtonClasses, panelEmptyClasses, panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import { postListReorder } from '$lib/client/postListReorder';
	import type { GoalSummary } from '$lib/server/goals/getGoalSummaries';

	let { goalSummaries }: { goalSummaries: GoalSummary[] } = $props();

	let isAddGoalModalOpen = $state(false);
	let isPriorityModalOpen = $state(false);
	let priorityGoal = $state<GoalSummary | null>(null);
	let shouldIncludeClosed = $state(false);

	const listReorder = new ListReorder((movedGoalId, targetGoalId, placement) =>
		postListReorder('?/placeGoal', { movedGoalId, targetGoalId, placement })
	);

	const shownGoalSummaries = $derived(
		shouldIncludeClosed ? goalSummaries : openGoalsOnly(goalSummaries)
	);

	function openPriorityModal(goalSummary: GoalSummary) {
		priorityGoal = goalSummary;
		isPriorityModalOpen = true;
	}
</script>

<DashboardPanel title="Goals" count={shownGoalSummaries.length}>
	{#snippet actions()}
		<GoalStatusFilter bind:shouldIncludeClosed />
		<button type="button" onclick={() => (isAddGoalModalOpen = true)} class={panelButtonClasses}>
			＋ Goal
		</button>
	{/snippet}
	{#if goalSummaries.length === 0}
		<p class={panelEmptyClasses}>
			No goals yet — a goal is what the project must achieve, with a measure both sides can check.
		</p>
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

<Modal title="Add goal" bind:isOpen={isAddGoalModalOpen}>
	<AddGoalForm onCreated={() => (isAddGoalModalOpen = false)} />
</Modal>

{#if priorityGoal !== null}
	<PriorityModal
		itemName={priorityGoal.title}
		priority={priorityGoal.priority}
		among="of the project’s goals"
		action="?/setGoalPriority"
		fields={{ goalId: priorityGoal.id }}
		bind:isOpen={isPriorityModalOpen}
	/>
{/if}
