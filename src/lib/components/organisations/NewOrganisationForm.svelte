<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import OrganisationDetailsFields from './OrganisationDetailsFields.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { emptyAccountsContact } from '$lib/data/organisationRules';
	import { organisationSubmitClasses } from './organisationFormStyles';

	let { action, onCreated }: { action: string; onCreated: () => void } = $props();

	const tracker = new FormTracker();
	const blankDetails = { name: '', address: '', accountsContact: emptyAccountsContact };
	const namePlaceholder = 'The Construction Company Ltd';
</script>

<form method="POST" {action} use:enhance={tracker.submit(onCreated)} class="flex flex-col gap-4">
	<OrganisationDetailsFields details={blankDetails} {namePlaceholder} />
	<FormErrorNote message={tracker.errorMessage} />
	<SubmitButton isSaving={tracker.isSaving} savingLabel="Creating…" class={organisationSubmitClasses}>
		Create organisation
	</SubmitButton>
</form>
