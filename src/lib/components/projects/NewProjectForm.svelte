<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import OrganisationSelect from '$lib/components/organisations/OrganisationSelect.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import type { Organisation } from '$lib/server/organisations/organisationRecord';

	let { organisations, onCreated }: { organisations: Organisation[]; onCreated: () => void } = $props();

	const tracker = new FormTracker();

	const fieldClasses =
		'rounded-xl border border-hairline bg-night px-4 py-2.5 text-chalk outline-none focus:border-go';
	const labelClasses = 'font-display text-sm tracking-widest text-chalk/50 uppercase';
</script>

<form
	method="POST"
	action="?/createProject"
	use:enhance={tracker.submit(onCreated)}
	class="flex flex-col gap-4"
>
	<label class="flex flex-col gap-1">
		<span class={labelClasses}>Name</span>
		<input name="name" required placeholder="Project name" class={fieldClasses} />
	</label>
	<label class="flex flex-col gap-1">
		<span class={labelClasses}>Description</span>
		<textarea
			name="description"
			rows="3"
			placeholder="What this project is for (optional)"
			class={fieldClasses}
		></textarea>
	</label>
	<OrganisationSelect {organisations} selectedOrganisationId={null} {fieldClasses} {labelClasses} />
	<FormErrorNote message={tracker.errorMessage} />
	<SubmitButton
		isSaving={tracker.isSaving}
		savingLabel="Creating…"
		class="self-end rounded-full bg-go px-6 py-2.5 font-display text-sm font-medium text-night
			transition hover:brightness-110"
	>
		Create project
	</SubmitButton>
</form>
