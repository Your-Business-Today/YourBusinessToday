<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { displayNameMaxLength } from '$lib/data/displayNameRules';
	import SmallCapsField from '$lib/components/site/SmallCapsField.svelte';

	let { displayName, onSaved }: { displayName: string; onSaved: () => void } = $props();

	const tracker = new FormTracker();
</script>

<form
	method="POST"
	action="?/saveDisplayName"
	use:enhance={tracker.submit(onSaved)}
	class="flex flex-col gap-4"
>
	<SmallCapsField label="Display name">
		<input
			name="displayName"
			value={displayName}
			maxlength={displayNameMaxLength}
			placeholder="How your name appears on tasks and comments"
			class="rounded-xl border border-hairline bg-night px-4 py-2.5 text-chalk outline-none
				focus:border-go"
		/>
	</SmallCapsField>
	<FormErrorNote message={tracker.errorMessage} />
	<SubmitButton
		isSaving={tracker.isSaving}
		class="self-end rounded-full bg-go px-6 py-2.5 font-display text-sm font-medium text-night
			transition hover:brightness-110"
	>
		Save
	</SubmitButton>
</form>
