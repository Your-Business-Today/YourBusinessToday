<script lang="ts">
	import AddGoalForm from './AddGoalForm.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import GoalList from './GoalList.svelte';
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
	import { panelButtonClasses, panelEmptyClasses } from '$lib/components/workspace/workspaceStyles';
	import type { GoalSummary } from '$lib/server/goals/summariseGoals';
	import type { Department } from '$lib/data/department';

	let {
		goalSummaries,
		horizon,
		department
	}: { goalSummaries: GoalSummary[]; horizon: GoalHorizon; department: Department } = $props();

	let isAddGoalModalOpen = $state(false);
	let isPriorityModalOpen = $state(false);
	let priorityGoal = $state<GoalSummary | null>(null);
	let shouldIncludeClosed = $state(false);

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
		<GoalList goalSummaries={shownGoalSummaries} onSetPriority={openPriorityModal} />
	{/if}
</DashboardPanel>

<Modal title={`Add ${goalHorizonLabels[horizon].toLowerCase()} goal`} bind:isOpen={isAddGoalModalOpen}>
	<AddGoalForm {horizon} {department} onCreated={() => (isAddGoalModalOpen = false)} />
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
