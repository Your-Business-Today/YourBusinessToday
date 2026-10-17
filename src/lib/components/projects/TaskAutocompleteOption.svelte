<script lang="ts">
	import { enhance } from '$app/forms';
	import { autocompleteChoiceLabels, type AutocompleteChoice } from '$lib/data/autocomplete';
	import type { SubmitFunction } from '@sveltejs/kit';

	let {
		taskId,
		choice,
		isCurrent,
		isSaving,
		submit
	}: {
		taskId: string;
		choice: AutocompleteChoice;
		isCurrent: boolean;
		isSaving: boolean;
		submit: SubmitFunction;
	} = $props();

	const optionClasses = $derived(
		isCurrent ? 'border-go bg-go/10 text-go' : 'border-hairline text-chalk/80 hover:border-go hover:text-go'
	);
</script>

<form method="POST" action="?/setAutocomplete" use:enhance={submit}>
	<input type="hidden" name="taskId" value={taskId} />
	<input type="hidden" name="autocomplete" value={choice} />
	<button
		type="submit"
		disabled={isCurrent || isSaving}
		class={`w-full rounded-xl border px-2 py-3 font-display text-sm transition
			disabled:cursor-default ${optionClasses}`}
	>
		{autocompleteChoiceLabels[choice]}
	</button>
</form>
