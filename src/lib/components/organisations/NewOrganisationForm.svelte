<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import OrganisationDetailsFields from './OrganisationDetailsFields.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { emptyAccountsContact } from '$lib/data/organisationRules';
	import { organisationSubmitClasses } from './organisationFormStyles';

	let {
		action,
		parentName = null,
		onCreated
	}: { action: string; parentName?: string | null; onCreated: () => void } = $props();

	const tracker = new FormTracker();
	const blankDetails = { name: '', address: '', accountsContact: emptyAccountsContact };
	const namePlaceholder = $derived(parentName === null ? 'Jewel Enterprises' : `A business of ${parentName}`);
	const submitLabel = $derived(parentName === null ? 'Create organisation' : 'Add sub-organisation');
</script>

<form method="POST" {action} use:enhance={tracker.submit(onCreated)} class="flex flex-col gap-4">
	<OrganisationDetailsFields details={blankDetails} {namePlaceholder} />
	{#if parentName !== null}
		<p class="text-xs text-chalk/50">
			Leave blank whatever it shares with {parentName}; set only what differs, so it is invoiced on its own.
		</p>
	{/if}
	<FormErrorNote message={tracker.errorMessage} />
	<SubmitButton isSaving={tracker.isSaving} savingLabel="Creating…" class={organisationSubmitClasses}>
		{submitLabel}
	</SubmitButton>
</form>
