<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import OrganisationDetailsFields from './OrganisationDetailsFields.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { organisationSubmitClasses } from './organisationFormStyles';
	import type { Organisation } from '$lib/server/organisations/organisationRecord';

	let { organisation, onSaved }: { organisation: Organisation; onSaved: () => void } = $props();

	const tracker = new FormTracker();
</script>

<form method="POST" action="?/updateDetails" use:enhance={tracker.submit(onSaved)} class="flex flex-col gap-4">
	<OrganisationDetailsFields details={organisation} namePlaceholder={organisation.name} />
	<FormErrorNote message={tracker.errorMessage} />
	<SubmitButton isSaving={tracker.isSaving} class={organisationSubmitClasses}>Save</SubmitButton>
</form>
