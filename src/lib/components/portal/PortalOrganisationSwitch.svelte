<script lang="ts">
	import { enhance } from '$app/forms';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { quietButtonClasses, selectClasses } from '$lib/components/site/formStyles';
	import type { PortalVisitor } from '$lib/portal/portalVisitor';

	let { visitor }: { visitor: PortalVisitor } = $props();

	const tracker = new FormTracker();
</script>

<DashboardPanel title="Your organisations">
	<form method="POST" action="?/switchOrganisation" use:enhance={tracker.submit()} class="flex flex-col gap-3 p-4">
		<p class="text-sm text-chalk/70">You are a contact at more than one organisation. Choose the one to work in.</p>
		<select name="clientId" aria-label="Organisation" value={visitor.clientId} class={selectClasses}>
			{#each visitor.organisations as organisation (organisation.clientId)}
				<option value={organisation.clientId}>{organisation.name}</option>
			{/each}
		</select>
		<FormErrorNote message={tracker.errorMessage} />
		<SubmitButton isSaving={tracker.isSaving} savingLabel="Switching…" class={`${quietButtonClasses} self-start`}>
			Switch organisation
		</SubmitButton>
	</form>
</DashboardPanel>
