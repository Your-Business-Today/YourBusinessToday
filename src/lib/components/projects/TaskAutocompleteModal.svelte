<script lang="ts">
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import TaskAutocompleteOption from './TaskAutocompleteOption.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { autocompleteChoices, autocompleteSentence, choiceForSetting } from '$lib/data/autocomplete';
	import { staffOnlyAutocompleteRefusal } from '$lib/data/autocompleteStanding';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	let {
		task,
		isGoalAutocomplete,
		canTurnOnAutocomplete,
		isOpen = $bindable()
	}: {
		task: ProjectTask;
		isGoalAutocomplete: boolean | null;
		canTurnOnAutocomplete: boolean;
		isOpen: boolean;
	} = $props();

	const tracker = new FormTracker();
	const currentChoice = $derived(choiceForSetting(task.autocompleteSetting));

	const offeredChoices = $derived(
		Object.values(autocompleteChoices).filter(
			(choice) => canTurnOnAutocomplete || choice === autocompleteChoices.off
		)
	);

	$effect(() => {
		if (!isOpen) tracker.reset();
	});
</script>

<Modal title="Autocomplete" bind:isOpen>
	<div class="flex flex-col gap-4">
		<p class="text-sm text-chalk/60">{task.title}</p>
		<p class="text-xs text-chalk/45">
			When it is on, an AI running on a schedule may take this task through to a merged pull request
			without asking. {autocompleteSentence(task.autocompleteSetting, isGoalAutocomplete)}
		</p>
		{#if !canTurnOnAutocomplete}
			<p class="text-xs text-chalk/45">{staffOnlyAutocompleteRefusal}</p>
		{/if}
		<FormErrorNote message={tracker.errorMessage} />
		<div class="grid grid-cols-3 gap-2" class:animate-pulse={tracker.isSaving}>
			{#each offeredChoices as choice (choice)}
				<TaskAutocompleteOption
					taskId={task.id}
					{choice}
					isCurrent={choice === currentChoice}
					isSaving={tracker.isSaving}
					submit={tracker.submit(() => (isOpen = false))}
				/>
			{/each}
		</div>
	</div>
</Modal>
