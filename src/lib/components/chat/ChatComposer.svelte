<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/site/Button.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { chatMessageLimits } from '$lib/data/chat/chatMessageRules';

	let { roomName }: { roomName: string } = $props();

	const tracker = new FormTracker();
</script>

<form method="POST" action="?/postMessage" use:enhance={tracker.submit()} class="flex flex-col gap-3 border-t border-hairline p-4">
	<FormField label={`Say something in ${roomName}`}>
		<textarea name="body" rows="3" required maxlength={chatMessageLimits.longestBody}></textarea>
	</FormField>
	<FormErrorNote message={tracker.errorMessage} />
	<div class="flex justify-end">
		<Button type="submit" look="primary" isSaving={tracker.isSaving} savingLabel="Sending…">Send</Button>
	</div>
</form>
