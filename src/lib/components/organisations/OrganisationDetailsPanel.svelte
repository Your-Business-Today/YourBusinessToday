<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import OrganisationDetailList from './OrganisationDetailList.svelte';
	import OrganisationDetailsForm from './OrganisationDetailsForm.svelte';
	import { organisationDetailGroups } from '$lib/data/organisationDetailGroups';
	import { paneToolbarClasses } from '$lib/components/workspace/workspaceStyles';
	import type { Organisation } from '$lib/server/organisations/organisationRecord';

	let { organisation, canManage }: { organisation: Organisation; canManage: boolean } = $props();

	let isEditModalOpen = $state(false);
</script>

{#if canManage}
	<div class={paneToolbarClasses}>
		<Button onclick={() => (isEditModalOpen = true)}>Edit details</Button>
	</div>
{/if}

<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
	{#each organisationDetailGroups as group (group.key)}
		<DashboardPanel title={group.title} isPadded>
			<OrganisationDetailList fields={group.fields} details={organisation} />
		</DashboardPanel>
	{/each}
</div>

<Modal title={`Edit ${organisation.name}`} maxWidthClass="max-w-2xl" bind:isOpen={isEditModalOpen}>
	<OrganisationDetailsForm {organisation} onSaved={() => (isEditModalOpen = false)} />
</Modal>
