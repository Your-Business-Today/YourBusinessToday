<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/site/Button.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { decisionAnswerFields } from '$lib/data/boardDecisionForm';
	import { boardDecisionLimits } from '$lib/data/boardroomDecisionRules';
	import { decisionAnswers } from '$lib/data/boardroomDecision';

	let { itemNumber }: { itemNumber: number } = $props();

	const tracker = new FormTracker();
</script>

<form method="POST" action="?/answerDecision" use:enhance={tracker.submit()} class="flex flex-col gap-3">
	<input type="hidden" name={decisionAnswerFields.itemNumber} value={itemNumber} />
	<FormField label="Your reason, if you give one" hint="Kept with your answer; every director reads it">
		<textarea name={decisionAnswerFields.reason} rows="2" maxlength={boardDecisionLimits.longestReason}></textarea>
	</FormField>
	{#if tracker.errorMessage !== null}
		<p class="text-sm font-medium text-signal">{tracker.errorMessage}</p>
	{/if}
	<p class="text-xs text-chalk-subtle">Your answer is your own, given once and kept as you give it.</p>
	<div class="flex flex-wrap gap-2">
		<Button look="primary" type="submit" name={decisionAnswerFields.answer} value={decisionAnswers.agrees} isSaving={tracker.isSaving}>I agree</Button>
		<Button type="submit" name={decisionAnswerFields.answer} value={decisionAnswers.disagrees} disabled={tracker.isSaving}>I disagree</Button>
		<Button type="submit" name={decisionAnswerFields.answer} value={decisionAnswers.abstains} disabled={tracker.isSaving}>I abstain</Button>
	</div>
</form>
