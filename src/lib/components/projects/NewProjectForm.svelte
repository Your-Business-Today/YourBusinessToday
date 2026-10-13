<script lang="ts">
	import { fieldClasses } from '$lib/components/site/formStyles';
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import OrganisationSelect from '$lib/components/organisations/OrganisationSelect.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import TeamProjectField from './TeamProjectField.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import type { Organisation } from '$lib/server/organisations/organisationRecord';
	import SmallCapsField from '$lib/components/site/SmallCapsField.svelte';

	let { organisations, onCreated }: { organisations: Organisation[]; onCreated: () => void } = $props();

	const tracker = new FormTracker();
</script>

<form
	method="POST"
	action="?/createProject"
	use:enhance={tracker.submit(onCreated)}
	class="flex flex-col gap-4"
>
	<SmallCapsField label="Name">
		<input name="name" required placeholder="Project name" class={fieldClasses} />
	</SmallCapsField>
	<SmallCapsField label="Description">
		<textarea
			name="description"
			rows="3"
			placeholder="What this project is for (optional)"
			class={fieldClasses}
		></textarea>
	</SmallCapsField>
	<OrganisationSelect {organisations} selectedOrganisationId={null} />
	<TeamProjectField isTeamProject={false} />
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
