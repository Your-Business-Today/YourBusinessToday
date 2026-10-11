<script lang="ts">
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import FlashMessage from '$lib/components/workspace/FlashMessage.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import NewOrganisationForm from '$lib/components/organisations/NewOrganisationForm.svelte';
	import OrganisationRegister from '$lib/components/organisations/OrganisationRegister.svelte';
	import OrganisationsPageHeader from '$lib/components/organisations/OrganisationsPageHeader.svelte';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data, form } = $props();

	const { organisations } = $derived(data);

	let isNewOrganisationModalOpen = $state(false);

	const emptyMessage = $derived(
		data.canCreate
			? 'No organisations yet. Create one for each client, and one for Your Business Today.'
			: 'You are not on an organisation yet. Whoever manages one brings you on by email.'
	);
</script>

<svelte:head>
	<title>Organisations — Your Business Today</title>
</svelte:head>

<OrganisationsPageHeader canCreate={data.canCreate} onNewOrganisation={() => (isNewOrganisationModalOpen = true)} />

<div class={workspaceBodyClasses}>
	<FlashMessage message={form?.message} />
	{#if organisations.length === 0}
		<EmptyState message={emptyMessage} />
	{:else}
		<OrganisationRegister {organisations} />
	{/if}
</div>

<Modal title="New organisation" bind:isOpen={isNewOrganisationModalOpen}>
	<NewOrganisationForm action="?/createOrganisation" onCreated={() => (isNewOrganisationModalOpen = false)} />
</Modal>
