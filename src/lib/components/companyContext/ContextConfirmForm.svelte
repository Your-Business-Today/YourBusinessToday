<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { confirmButtonClasses } from '$lib/components/site/formStyles';
	import { confirmInvitation } from '$lib/data/companyContext/contextConfirmation';

	let { versionNumber }: { versionNumber: number } = $props();

	const tracker = new FormTracker();
</script>

<form method="POST" action="?/confirmContext" use:enhance={tracker.submit()} class="flex flex-col gap-3">
	<input type="hidden" name="versionNumber" value={versionNumber} />
	<p class="text-chalk/80">{confirmInvitation(versionNumber)}</p>
	<FormErrorNote message={tracker.errorMessage} />
	<SubmitButton isSaving={tracker.isSaving} class={`${confirmButtonClasses} self-start`}>
		Confirm it is right
	</SubmitButton>
</form>
