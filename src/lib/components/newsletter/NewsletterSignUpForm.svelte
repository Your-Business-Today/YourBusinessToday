<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { inputClasses, primaryButtonClasses } from '$lib/components/site/formStyles';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import {
		newsletterEmailLimit,
		newsletterHoneypotField,
		newsletterName,
		newsletterSignUpAction
	} from '$lib/data/newsletterSignUp';

	let { isSignedUpOnArrival = false }: { isSignedUpOnArrival?: boolean } = $props();

	const tracker = new FormTracker();
	let hasSignedUpHere = $state(false);
	const isSignedUp = $derived(isSignedUpOnArrival || hasSignedUpHere);

	function markSignedUp(): void {
		hasSignedUpHere = true;
	}
</script>

{#if isSignedUp}
	<p role="status" class="text-sm text-go">
		You are on the list. {newsletterName} comes to your inbox once a week.
	</p>
{:else}
	<form
		method="POST"
		action={newsletterSignUpAction}
		use:enhance={tracker.submit(markSignedUp, { shouldKeepFields: true })}
		class="relative flex flex-col gap-2"
	>
		<div class="flex flex-wrap gap-2">
			<input
				name="email"
				type="email"
				autocomplete="email"
				required
				maxlength={newsletterEmailLimit}
				placeholder="you@yourbusiness.co.uk"
				aria-label="Your email address"
				class={`${inputClasses} min-w-0 flex-1`}
			/>
			<SubmitButton isSaving={tracker.isSaving} savingLabel="Signing up…" class={primaryButtonClasses}>
				Sign up
			</SubmitButton>
		</div>
		<label class="absolute -left-[9999px] opacity-0" aria-hidden="true">
			Leave this empty
			<input name={newsletterHoneypotField} tabindex="-1" autocomplete="off" />
		</label>
		<FormErrorNote message={tracker.errorMessage} />
	</form>
{/if}
