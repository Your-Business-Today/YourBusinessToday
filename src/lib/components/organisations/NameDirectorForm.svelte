<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { organisationSubmitClasses } from './organisationFormStyles';
	import type { OrganisationMember } from '$lib/server/organisations/organisationMemberRecord';

	let { candidates, onNamed }: { candidates: OrganisationMember[]; onNamed: () => void } = $props();

	const tracker = new FormTracker();
</script>

<form method="POST" action="?/setDirector" use:enhance={tracker.submit(onNamed)} class="flex flex-col gap-4">
	<input type="hidden" name="isDirector" value="true" />
	<FormField label="Person" hint="Only named directors enter the boardroom.">
		<select name="accountId" required>
			{#each candidates as candidate (candidate.id)}
				<option value={candidate.id}>{candidate.name}</option>
			{/each}
		</select>
	</FormField>
	<FormErrorNote message={tracker.errorMessage} />
	<SubmitButton isSaving={tracker.isSaving} class={organisationSubmitClasses}>Name director</SubmitButton>
</form>
