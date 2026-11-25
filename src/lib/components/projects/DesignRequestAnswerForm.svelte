<script lang="ts">
	import { enhance } from '$app/forms';
	import FormField from '$lib/components/site/FormField.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { designReviewLimits } from '$lib/data/designReview';
	import { requestedAnswerButtonClasses } from './requestedStyles';

	let { taskId }: { taskId: string } = $props();

	const tracker = new FormTracker();
</script>

<form
	method="POST"
	action="?/answerDesignRequest"
	use:enhance={tracker.submit(undefined, { shouldKeepFields: true })}
	class="flex flex-wrap items-end gap-2 pt-1"
>
	<input type="hidden" name="taskId" value={taskId} />
	<FormField label="Turn this one down, with the reason" class="min-w-0 flex-1">
		<textarea name="reason" rows="1" required maxlength={designReviewLimits.longestText}></textarea>
	</FormField>
	<button type="submit" name="answer" value="reject" disabled={tracker.isSaving} class={requestedAnswerButtonClasses}>
		Reject
	</button>
	{#if tracker.errorMessage}
		<p class="w-full text-xs text-caution" role="alert">{tracker.errorMessage}</p>
	{/if}
</form>
