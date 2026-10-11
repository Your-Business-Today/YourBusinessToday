<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import SmallCapsField from '$lib/components/site/SmallCapsField.svelte';

	let { onInvited }: { onInvited: () => void } = $props();

	const tracker = new FormTracker();
</script>

<form
	method="POST"
	action="?/invitePerson"
	use:enhance={tracker.submit(onInvited)}
	class="flex flex-col gap-4"
>
	<SmallCapsField label="Email address">
		<input
			name="email"
			type="email"
			required
			placeholder="Where to send the invitation"
			class="rounded-xl border border-hairline bg-night px-4 py-2.5 text-chalk outline-none
				focus:border-go"
		/>
	</SmallCapsField>
	<p class="text-xs text-chalk/50">
		They join the project straight away and get an email. Someone new here sets a password from
		it; someone with an account just signs in. They can then work every goal and task on this
		project — on the site or through their own assistant — and nothing else of yours.
	</p>
	<FormErrorNote message={tracker.errorMessage} />
	<SubmitButton
		isSaving={tracker.isSaving}
		savingLabel="Inviting…"
		class="self-end rounded-full bg-go px-6 py-2.5 font-display text-sm font-medium text-night
			transition hover:brightness-110"
	>
		Invite
	</SubmitButton>
</form>
