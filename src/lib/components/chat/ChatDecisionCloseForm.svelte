<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/site/Button.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { chatDecisionLimits, type ListedChatDecision } from '$lib/data/chat/chatDecisionRules';
	import { raisedSentence } from '$lib/data/chat/chatDecisionWords';

	let { decision, onClosed }: { decision: ListedChatDecision; onClosed: () => void } = $props();

	const tracker = new FormTracker();
</script>

<form method="POST" action="?/closeDecision" use:enhance={tracker.submit(onClosed, { shouldKeepFields: true })} class="flex flex-col gap-4">
	<input type="hidden" name="decisionId" value={decision.id} />
	<div class="flex flex-col gap-1 text-sm">
		<p class="text-chalk">{decision.wording}</p>
		<p class="text-xs text-chalk-subtle">{raisedSentence(decision)}</p>
	</div>
	<FormField label="The outcome" hint="Once closed, a decision is not reopened.">
		<textarea name="outcome" rows="3" required maxlength={chatDecisionLimits.longestOutcome}></textarea>
	</FormField>
	<FormErrorNote message={tracker.errorMessage} />
	<Button type="submit" look="primary" isSaving={tracker.isSaving} savingLabel="Closing…">Close the decision</Button>
</form>
