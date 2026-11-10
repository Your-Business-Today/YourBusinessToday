<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/site/Button.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { boardActionFields } from '$lib/data/boardActionForm';
	import { boardActionLimits } from '$lib/data/boardroomActionRules';
	import ActionPlaceFields from './ActionPlaceFields.svelte';
	import { boardActionChoices } from './boardActionChoicesContext';

	let { itemNumber }: { itemNumber: number } = $props();

	const tracker = new FormTracker();
	const choices = $derived(boardActionChoices());
</script>

<form method="POST" action="?/recordAction" use:enhance={tracker.submit()} class="flex flex-col gap-3">
	<input type="hidden" name={boardActionFields.itemNumber} value={itemNumber} />
	<FormField label="What is to be done" hint="Short enough for a task's title">
		<input name={boardActionFields.what} required maxlength={boardActionLimits.longestWhat} />
	</FormField>
	<div class="flex flex-wrap gap-3">
		<FormField label="Who owns it" class="min-w-0 flex-1">
			<select name={boardActionFields.owner} required>
				{#each choices.people as person (person.id)}
					<option value={person.id}>{person.name}</option>
				{/each}
			</select>
		</FormField>
		<FormField label="Due, if a date was given" class="min-w-0 flex-1">
			<input type="date" name={boardActionFields.dueOn} />
		</FormField>
	</div>
	<ActionPlaceFields projects={choices.projects} />
	{#if tracker.errorMessage !== null}
		<p class="text-sm font-medium text-signal">{tracker.errorMessage}</p>
	{/if}
	<div>
		<Button type="submit" isSaving={tracker.isSaving}>Record the action</Button>
	</div>
</form>
