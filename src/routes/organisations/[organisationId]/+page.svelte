<script lang="ts">
	import DangerConfirmModal from '$lib/components/site/DangerConfirmModal.svelte';
	import FlashMessage from '$lib/components/workspace/FlashMessage.svelte';
	import InvoicingDetailsPanel from '$lib/components/organisations/InvoicingDetailsPanel.svelte';
	import OrganisationPeoplePanel from '$lib/components/organisations/OrganisationPeoplePanel.svelte';
	import OrganisationProjectsPanel from '$lib/components/organisations/OrganisationProjectsPanel.svelte';
	import SubOrganisationsPanel from '$lib/components/organisations/SubOrganisationsPanel.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { dashboardGridClasses, headerDangerButtonClasses, workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';
	import { organisationCrumbs } from '$lib/components/organisations/organisationCrumbs';

	let { data, form } = $props();

	const { organisation, parent } = $derived(data);

	let isDeleteModalOpen = $state(false);

	const isTopLevel = $derived(organisation.parentOrganisationId === null);
</script>

<svelte:head>
	<title>{organisation.name} — Organisations — Your Business Today</title>
</svelte:head>

<WorkspaceHeader crumbs={organisationCrumbs(parent)} title={organisation.name}>
	{#snippet actions()}
		{#if data.isStaff}
			<button type="button" onclick={() => (isDeleteModalOpen = true)} class={headerDangerButtonClasses}>
				Delete
			</button>
		{/if}
	{/snippet}
	<p class="text-sm text-chalk/60">
		{#if isTopLevel}
			Everyone on {organisation.name} is on every project under it and under each of its businesses.
		{:else if parent === null}
			A business of an organisation you are not on yourself. Everyone on it is on its projects.
		{:else}
			A business of {parent.name}. Everyone on it is on its projects; so is everyone on {parent.name}.
		{/if}
	</p>
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	<FlashMessage message={form?.message} />
	<div class={dashboardGridClasses}>
		<div class="flex min-w-0 flex-col gap-4">
			<OrganisationProjectsPanel {organisation} projects={data.projects} />
			{#if isTopLevel}
				<SubOrganisationsPanel {organisation} children={data.children} canManage={data.canManage} />
			{/if}
		</div>
		<aside class="flex min-w-0 flex-col gap-4">
			<OrganisationPeoplePanel {organisation} {parent} members={data.members} canManage={data.canManage} />
			<InvoicingDetailsPanel {organisation} {parent} canManage={data.canManage} />
		</aside>
	</div>
</div>

<DangerConfirmModal
	title="Delete organisation"
	description={`This deletes “${organisation.name}”, every business under it, and the access it gave people. Its projects stay, under no organisation. This cannot be undone.`}
	action="?/deleteOrganisation"
	fields={{}}
	submitLabel="Delete organisation"
	confirmWord={organisation.name}
	bind:isOpen={isDeleteModalOpen}
/>
