<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SmallCapsField from '$lib/components/site/SmallCapsField.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { confirmButtonClasses, fieldClasses } from '$lib/components/site/formStyles';
	import { onboardingSignUpLimits as limits } from '$lib/onboarding/onboarding';

	const tracker = new FormTracker();
</script>

<form method="POST" use:enhance={tracker.submit(undefined, { shouldKeepFields: true })} class="flex flex-col gap-4">
	<SmallCapsField label="Your business’s name">
		<input name="businessName" required maxlength={limits.businessNameLength} class={fieldClasses} />
	</SmallCapsField>
	<SmallCapsField label="Your name">
		<input name="personName" required maxlength={limits.personNameLength} class={fieldClasses} />
	</SmallCapsField>
	<FormErrorNote message={tracker.errorMessage} />
	<SubmitButton isSaving={tracker.isSaving} savingLabel="Starting…" class={`${confirmButtonClasses} self-start`}>
		Start onboarding
	</SubmitButton>
</form>
