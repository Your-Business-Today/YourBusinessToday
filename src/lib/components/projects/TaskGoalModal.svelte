<script lang="ts">
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import TaskGoalChoiceForm, { type GoalChoice } from './TaskGoalChoiceForm.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { goalHorizonOrder, goalsOnHorizon, isCurrentGoal } from '$lib/data/goalHorizon';
	import type { Goal } from '$lib/server/goals/goalRecord';

	let {
		taskId,
		taskTitle,
		currentGoalId,
		goals,
		isOpen = $bindable()
	}: {
		taskId: string;
		taskTitle: string;
		currentGoalId: string | null;
		goals: Goal[];
		isOpen: boolean;
	} = $props();

	const tracker = new FormTracker();
	const noGoalChoice: GoalChoice = { id: null, title: 'No goal', isLongTerm: false };
	const goalChoices: GoalChoice[] = $derived([...goalsByHorizon().map(choiceFor), noGoalChoice]);

	$effect(() => {
		if (!isOpen) tracker.reset();
	});

	function goalsByHorizon(): Goal[] {
		return goalHorizonOrder.flatMap((horizon) => goalsOnHorizon(goals, horizon));
	}

	function choiceFor(goal: Goal): GoalChoice {
		return { id: goal.id, title: goal.title, isLongTerm: !isCurrentGoal(goal) };
	}
</script>

<Modal title="Change goal" bind:isOpen>
	<div class="flex flex-col gap-4">
		<p class="text-sm text-chalk/60">{taskTitle}</p>
		<FormErrorNote message={tracker.errorMessage} />
		<div class="flex flex-col gap-2" class:animate-pulse={tracker.isSaving}>
			{#each goalChoices as goalChoice (goalChoice.id ?? 'no-goal')}
				<TaskGoalChoiceForm
					{taskId}
					{goalChoice}
					isChosen={goalChoice.id === currentGoalId}
					{tracker}
					onSaved={() => (isOpen = false)}
				/>
			{/each}
		</div>
	</div>
</Modal>
