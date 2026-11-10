<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import OrganisationDetailsForm from './OrganisationDetailsForm.svelte';
	import { invoicingFieldLabels, type InvoicingField } from '$lib/data/organisationInvoicing';
	import { panelButtonClasses } from '$lib/components/workspace/workspaceStyles';
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

<DashboardPanel title="Invoicing">
	{#snippet actions()}
		{#if canManage}
			<button type="button" onclick={() => (isEditModalOpen = true)} class={panelButtonClasses}>Edit</button>
		{/if}
	{/snippet}
	<dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 px-4 py-3 text-sm">
		{#each rows as row (row.field)}
			<dt class="text-chalk/50">{invoicingFieldLabels[row.field]}</dt>
			<dd class="min-w-0 whitespace-pre-line break-words">
				{row.value === '' ? 'Not set' : row.value}
			</dd>
		{/each}
	</dl>
</DashboardPanel>

<Modal title={`Edit ${organisation.name}`} bind:isOpen={isEditModalOpen}>
	<OrganisationDetailsForm {organisation} onSaved={() => (isEditModalOpen = false)} />
</Modal>
