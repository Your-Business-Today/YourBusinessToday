<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { organisationFieldClasses, organisationSubmitClasses } from './organisationFormStyles';
	import SmallCapsField from '$lib/components/site/SmallCapsField.svelte';

	let { organisationName, onInvited }: { organisationName: string; onInvited: () => void } = $props();

	const tracker = new FormTracker();
</script>

<form method="POST" action="?/invitePerson" use:enhance={tracker.submit(onInvited)} class="flex flex-col gap-4">
	<SmallCapsField label="Email address">
		<input name="email" type="email" required placeholder="Where to send the invitation" class={organisationFieldClasses} />
	</SmallCapsField>
	<label class="flex items-center gap-3 text-sm">
		<input type="checkbox" name="isManager" class="accent-go" />
		Project manager — they can bring people on to {organisationName} and anything under it
	</label>
	<p class="text-xs text-chalk/50">
		They are on every project under {organisationName} straight away, and on each new one as it starts.
		Someone new here sets a password from the email; someone with an account just signs in.
	</p>
	<FormErrorNote message={tracker.errorMessage} />
	<SubmitButton isSaving={tracker.isSaving} savingLabel="Inviting…" class={organisationSubmitClasses}>
		Invite
	</SubmitButton>
</form>
