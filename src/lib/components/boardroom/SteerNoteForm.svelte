<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/site/Button.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { seatControlFields } from '$lib/data/boardSeatControlForm';
	import { seatControlLimits } from '$lib/data/boardroomSeatControlRules';

	const tracker = new FormTracker();
</script>

<form method="POST" action="?/steerClaude" use:enhance={tracker.submit()} class="flex flex-col gap-3">
	<FormField label="A note to your Claude" hint="It reads your latest note before its next turn">
		<textarea name={seatControlFields.words} rows="3" required maxlength={seatControlLimits.longestSteerNote}></textarea>
	</FormField>
	{#if tracker.errorMessage !== null}
		<p class="text-sm font-medium text-signal">{tracker.errorMessage}</p>
	{/if}
	<div class="flex justify-end">
		<Button look="primary" type="submit" isSaving={tracker.isSaving}>Send the note</Button>
	</div>
</form>
