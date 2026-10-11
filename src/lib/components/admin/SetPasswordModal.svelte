<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { inputClasses } from '$lib/components/site/formStyles';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { minimumPasswordLength } from '$lib/data/passwordRules';
	import SmallCapsField from '$lib/components/site/SmallCapsField.svelte';

	let { targetEmail, isOpen = $bindable() }: { targetEmail: string; isOpen: boolean } = $props();

	const tracker = new FormTracker();

	$effect(() => {
		if (!isOpen) tracker.reset();
	});
</script>

<Modal title="Set a password" bind:isOpen>
	<form
		method="POST"
		action="?/setPassword"
		use:enhance={tracker.submit(() => (isOpen = false))}
		class="flex flex-col gap-4"
	>
		<p class="text-sm text-chalk/70">
			Choose a password for <span class="text-chalk">{targetEmail}</span> and pass it on to them.
			They can change it themselves once they are in.
		</p>
		<input type="hidden" name="targetEmail" value={targetEmail} />
		<SmallCapsField label="Password">
			<input
				name="password"
				type="text"
				autocomplete="off"
				spellcheck="false"
				required
				minlength={minimumPasswordLength}
				placeholder={`At least ${minimumPasswordLength} characters`}
				class={inputClasses}
			/>
		</SmallCapsField>
		<FormErrorNote message={tracker.errorMessage} />
		<SubmitButton
			isSaving={tracker.isSaving}
			class="self-end rounded-full bg-go px-6 py-2.5 font-display text-sm font-medium text-night
				transition hover:brightness-110"
		>
			Set password
		</SubmitButton>
	</form>
</Modal>
