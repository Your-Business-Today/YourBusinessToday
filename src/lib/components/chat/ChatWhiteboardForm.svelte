<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/site/Button.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { chatWhiteboardLimits } from '$lib/data/chat/chatWhiteboardRules';

	const tracker = new FormTracker();
</script>

<form method="POST" action="?/createWhiteboard" use:enhance={tracker.submit(undefined, { shouldKeepFields: true })} class="flex flex-col gap-4">
	<FormField label="New whiteboard" hint="Give it a title; it opens blank to draw on.">
		<input name="title" required maxlength={chatWhiteboardLimits.longestTitle} autocomplete="off" />
	</FormField>
	<FormErrorNote message={tracker.errorMessage} />
	<div class="flex justify-end">
		<Button type="submit" look="primary" isSaving={tracker.isSaving} savingLabel="Starting…">New whiteboard</Button>
	</div>
</form>
