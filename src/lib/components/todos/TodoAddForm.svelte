<script lang="ts">
	import { enhance } from '$app/forms';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { inputClasses } from '$lib/components/site/formStyles';
	import { todoLimits } from '$lib/data/todo';

	const tracker = new FormTracker();
</script>

<form
	method="POST"
	action="?/addTodo"
	use:enhance={tracker.submit()}
	class="flex flex-wrap items-center gap-2 px-4 py-3"
>
	<input
		name="title"
		required
		maxlength={todoLimits.longestTitle}
		placeholder="Something you have to do…"
		aria-label="To-do"
		class={`min-w-0 flex-1 ${inputClasses}`}
	/>
	<input name="dueDate" type="date" aria-label="Due" class={inputClasses} />
	<SubmitButton isSaving={tracker.isSaving} savingLabel="Adding…">Add</SubmitButton>
	<FormErrorNote message={tracker.errorMessage} />
</form>
