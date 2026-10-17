<script lang="ts">
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import { confirmButtonClasses, quietButtonClasses } from '$lib/components/site/formStyles';
	import { reviewDecisionLabels, reviewDecisions, type SimilarTaskReview } from '$lib/data/similarTaskReview';
	import { enhance } from '$app/forms';

	let { review }: { review: SimilarTaskReview } = $props();

	const tracker = new FormTracker();
	const decisionButtons = [
		{ decision: reviewDecisions.keepBoth, classes: quietButtonClasses },
		{ decision: reviewDecisions.merge, classes: confirmButtonClasses },
		{ decision: reviewDecisions.replace, classes: confirmButtonClasses }
	];
</script>

<form method="POST" action="?/answerSimilarTaskReview" use:enhance={tracker.submit()} class="flex flex-col gap-2">
	<p class="text-chalk/80">
		“{review.newTaskTitle}” on {review.newProjectName} looks like this task. What becomes of the two?
	</p>
	<input type="hidden" name="reviewId" value={review.id} />
	<div class="flex flex-wrap gap-2">
		{#each decisionButtons as button (button.decision)}
			<button type="submit" name="decision" value={button.decision} class={button.classes} disabled={tracker.isSaving}>
				{reviewDecisionLabels[button.decision]}
			</button>
		{/each}
	</div>
	<FormErrorNote message={tracker.errorMessage} />
</form>
