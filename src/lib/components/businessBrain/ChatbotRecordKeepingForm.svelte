<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/site/Button.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { chatbotRecordKeepingLimits, keptDaysField, type ChatbotRecordKeeping } from '$lib/data/chatbotRecordKeepingRules';
	import { keepingSentence } from '$lib/data/chatbotRecordKeepingWording';

	let { keeping }: { keeping: ChatbotRecordKeeping } = $props();

	const { shortestKeptDays, longestKeptDays } = chatbotRecordKeepingLimits;
	const tracker = new FormTracker();
	const sentence = $derived(keepingSentence(keeping));
	const keptDaysShown = $derived(keeping.keptDays === null ? '' : String(keeping.keptDays));
</script>

<form method="POST" action="?/setKeeping" use:enhance={tracker.submit()} class="flex flex-col gap-4">
	<p class="text-sm text-chalk-muted">{sentence} The period covers every chatbot of this Your Business Brain.</p>
	<FormField label="Keep each question for (days)" hint="Leave blank to keep it for as long as Your Business Brain is kept. Older questions are deleted overnight.">
		<input type="number" name={keptDaysField} value={keptDaysShown} min={shortestKeptDays} max={longestKeptDays} step="1" inputmode="numeric" />
	</FormField>
	<FormErrorNote message={tracker.errorMessage} />
	<div class="flex justify-end">
		<Button type="submit" look="primary" isSaving={tracker.isSaving}>Save the keeping period</Button>
	</div>
</form>
