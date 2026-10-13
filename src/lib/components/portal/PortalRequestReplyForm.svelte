<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { fieldClasses, quietButtonClasses } from '$lib/components/site/formStyles';
	import { portalRequestLimits } from '$lib/portal/portalRequest';

	let { requestId }: { requestId: string } = $props();

	const tracker = new FormTracker();
</script>

<form method="POST" action="?/replyToRequest" use:enhance={tracker.submit()} class="flex flex-col gap-2">
	<input type="hidden" name="taskId" value={requestId} />
	<textarea
		name="body"
		required
		rows="2"
		maxlength={portalRequestLimits.replyLength}
		placeholder="Reply"
		aria-label="Reply"
		class={fieldClasses}
	></textarea>
	<FormErrorNote message={tracker.errorMessage} />
	<SubmitButton isSaving={tracker.isSaving} savingLabel="Sending…" class={`${quietButtonClasses} self-start`}>
		Send reply
	</SubmitButton>
</form>
