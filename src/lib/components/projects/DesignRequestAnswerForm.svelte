<script lang="ts">
	import { enhance } from '$app/forms';
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
	<label class="flex min-w-0 flex-1 flex-col gap-1 text-xs text-chalk/60">
		Turn this one down, with the reason
		<textarea
			name="reason"
			rows="1"
			required
			maxlength={designReviewLimits.longestText}
			class="rounded-lg border border-hairline bg-transparent px-3 py-2 text-sm text-chalk"
		></textarea>
	</label>
	<button type="submit" name="answer" value="reject" disabled={tracker.isSaving} class={requestedAnswerButtonClasses}>
		Reject
	</button>
	{#if tracker.errorMessage}
		<p class="w-full text-xs text-caution" role="alert">{tracker.errorMessage}</p>
	{/if}
</form>
