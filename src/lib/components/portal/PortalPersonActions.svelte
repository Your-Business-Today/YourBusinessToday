<script lang="ts">
	import { enhance } from '$app/forms';
	import DangerConfirmModal from '$lib/components/site/DangerConfirmModal.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { dangerButtonClasses, quietButtonClasses } from '$lib/components/site/formStyles';
	import type { PortalPerson } from '$lib/portal/portalPerson';

	let { person }: { person: PortalPerson } = $props();

	let isRemoveModalOpen = $state(false);

	const tracker = new FormTracker();
	const administratorLabel = $derived(person.isAdministrator ? 'Stop being an administrator' : 'Make administrator');
</script>

<div class="flex flex-col items-end gap-2">
	<div class="flex flex-wrap gap-2">
		<form method="POST" action="?/setAdministrator" use:enhance={tracker.submit()}>
			<input type="hidden" name="contactId" value={person.contactId} />
			<input type="hidden" name="isAdministrator" value={String(!person.isAdministrator)} />
			<SubmitButton isSaving={tracker.isSaving} savingLabel="Saving…" class={quietButtonClasses}>
				{administratorLabel}
			</SubmitButton>
		</form>
		<button type="button" class={dangerButtonClasses} onclick={() => (isRemoveModalOpen = true)}>Remove</button>
	</div>
	<FormErrorNote message={tracker.errorMessage} />
</div>

<DangerConfirmModal
	title="Remove from your organisation"
	description={`${person.name} will no longer be able to sign in to your portal. You can invite them again later.`}
	action="?/removePerson"
	fields={{ contactId: person.contactId }}
	submitLabel="Remove"
	bind:isOpen={isRemoveModalOpen}
/>
