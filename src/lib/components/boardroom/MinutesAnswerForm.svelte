<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/site/Button.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { boardMinutesFields } from '$lib/data/boardMinutesForm';
	import { boardMinutesLimits } from '$lib/data/boardroomMinutesRules';
	import { minutesAnswers } from '$lib/data/boardroomMinutes';

	let { version }: { version: number } = $props();

	const tracker = new FormTracker();
</script>

<form method="POST" action="?/answerMinutes" use:enhance={tracker.submit()} class="flex flex-col gap-3">
	<input type="hidden" name={boardMinutesFields.version} value={version} />
	<FormField label="What you ask to change, if you do" hint="Kept with your answer; the chair's Claude writes a new version from it">
		<textarea name={boardMinutesFields.changeWords} rows="3" maxlength={boardMinutesLimits.longestChangeWords}></textarea>
	</FormField>
	{#if tracker.errorMessage !== null}
		<p class="text-sm font-medium text-signal">{tracker.errorMessage}</p>
	{/if}
	<p class="text-xs text-chalk-subtle">Your answer is to version {version} alone, given once and kept as you give it.</p>
	<div class="flex flex-wrap gap-2">
		<Button look="primary" type="submit" name={boardMinutesFields.answer} value={minutesAnswers.approves} isSaving={tracker.isSaving}>I approve these minutes</Button>
		<Button type="submit" name={boardMinutesFields.answer} value={minutesAnswers.asksForChange} disabled={tracker.isSaving}>I ask for a change</Button>
	</div>
</form>
