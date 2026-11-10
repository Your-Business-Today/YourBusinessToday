<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { companyContextLimits } from '$lib/data/companyContext/companyContextLimits';
	import { confirmButtonClasses, fieldClasses } from '$lib/components/site/formStyles';
	import { partMarkChoices } from '$lib/data/companyContext/companyContextWords';
	import { reviewStates } from '$lib/data/companyContext/companyContext';
	import { untrack } from 'svelte';
	import type { ContextPart, ReviewState } from '$lib/data/companyContext/companyContext';

	let { part, versionNumber }: { part: ContextPart; versionNumber: number } = $props();

	const tracker = new FormTracker();
	let chosenState = $state<ReviewState>(untrack(() => part.reviewState));
	const isNotRight = $derived(chosenState === reviewStates.notRight);
</script>

<form
	method="POST"
	action="?/markPart"
	use:enhance={tracker.submit(undefined, { shouldKeepFields: true })}
	class="flex flex-col gap-3 border-t border-hairline pt-4"
>
	<input type="hidden" name="versionNumber" value={versionNumber} />
	<input type="hidden" name="partKey" value={part.key} />
	<fieldset class="flex flex-col gap-2">
		<legend class="mb-2 text-chalk/70">Is this right?</legend>
		<div class="flex gap-5">
			{#each partMarkChoices as choice (choice.state)}
				<label class="flex items-center gap-2 text-chalk/80">
					<input type="radio" name="reviewState" value={choice.state} bind:group={chosenState} required />
					{choice.label}
				</label>
			{/each}
		</div>
	</fieldset>
	{#if isNotRight}
		<FormField label="What is wrong">
			<textarea
				name="whatIsWrong"
				required
				rows="3"
				maxlength={companyContextLimits.whatIsWrongLength}
				placeholder="Say it as you would to a colleague: your Claude puts it right on its next run."
				class={fieldClasses}>{part.whatIsWrong ?? ''}</textarea
			>
		</FormField>
	{/if}
	<FormErrorNote message={tracker.errorMessage} />
	<SubmitButton isSaving={tracker.isSaving} class={`${confirmButtonClasses} self-start`}>Save</SubmitButton>
</form>
