<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import OrganisationDetailsForm from './OrganisationDetailsForm.svelte';
	import { invoicingFieldLabels, type InvoicingField } from '$lib/data/organisationInvoicing';
	import { paneToolbarClasses } from '$lib/components/workspace/workspaceStyles';
	import type { Organisation } from '$lib/server/organisations/organisationRecord';

	let { organisation, canManage }: { organisation: Organisation; canManage: boolean } = $props();

	let isEditModalOpen = $state(false);

	const contact = $derived(organisation.accountsContact);
	const rows = $derived<{ field: InvoicingField; value: string }[]>([
		{ field: 'address', value: organisation.address },
		{ field: 'contactName', value: contact.name },
		{ field: 'contactEmail', value: contact.email },
		{ field: 'contactPhone', value: contact.phone }
	]);
</script>

{#if canManage}
	<div class={paneToolbarClasses}>
		<Button onclick={() => (isEditModalOpen = true)}>Edit details</Button>
	</div>
{/if}

<DashboardPanel isPadded>
	<dl class="grid grid-cols-1 gap-x-8 gap-y-1 text-sm sm:grid-cols-[12rem_1fr] sm:gap-y-4">
		{#each rows as row (row.field)}
			<dt class="font-medium text-chalk-subtle">{invoicingFieldLabels[row.field]}</dt>
			{#if row.value === ''}
				<dd class="pb-3 text-chalk-faint sm:pb-0">Not set</dd>
			{:else}
				<dd class="min-w-0 pb-3 break-words whitespace-pre-line text-chalk sm:pb-0">{row.value}</dd>
			{/if}
		{/each}
	</dl>
</DashboardPanel>

<Modal title={`Edit ${organisation.name}`} bind:isOpen={isEditModalOpen}>
	<OrganisationDetailsForm {organisation} onSaved={() => (isEditModalOpen = false)} />
</Modal>
