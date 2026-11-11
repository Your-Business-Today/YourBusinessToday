<script lang="ts">
	import DangerConfirmModal from '$lib/components/site/DangerConfirmModal.svelte';
	import FlashMessage from '$lib/components/workspace/FlashMessage.svelte';
	import InvoicingDetailsPanel from '$lib/components/organisations/InvoicingDetailsPanel.svelte';
	import OrganisationDirectorsPanel from '$lib/components/organisations/OrganisationDirectorsPanel.svelte';
	import OrganisationModulesPanel from '$lib/components/organisations/OrganisationModulesPanel.svelte';
	import OrganisationPeoplePanel from '$lib/components/organisations/OrganisationPeoplePanel.svelte';
	import OrganisationProjectsPanel from '$lib/components/organisations/OrganisationProjectsPanel.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { dashboardGridClasses, headerDangerButtonClasses, workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data, form } = $props();

	const { organisation } = $derived(data);

	let isDeleteModalOpen = $state(false);
</script>

<svelte:head>
	<title>{organisation.name} — Organisations — Your Business Today</title>
</svelte:head>

<WorkspaceHeader crumbs={[]} title={organisation.name}>
	{#snippet actions()}
		{#if data.isStaff}
			<button type="button" onclick={() => (isDeleteModalOpen = true)} class={headerDangerButtonClasses}>
				Delete
			</button>
		{/if}
	{/snippet}
	<p class="text-sm text-chalk-subtle">Everyone on {organisation.name} is on every project under it.</p>
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	<FlashMessage message={form?.message} />
	<div class={dashboardGridClasses}>
		<div class="flex min-w-0 flex-col gap-4">
			<OrganisationProjectsPanel {organisation} projects={data.projects} />
		</div>
		<aside class="flex min-w-0 flex-col gap-4">
			<OrganisationPeoplePanel {organisation} members={data.members} canManage={data.canManage} />
			<InvoicingDetailsPanel {organisation} canManage={data.canManage} />
			<OrganisationModulesPanel modules={data.modules} canSwitch={data.isStaff} />
			{#if data.modules.includes('boardroom')}
				<OrganisationDirectorsPanel directors={data.directors} members={data.members} canName={data.isStaff} />
			{/if}
		</aside>
	</div>
</div>

<DangerConfirmModal
	title="Delete organisation"
	description={`This deletes “${organisation.name}” and the access it gave people. Its projects stay, under no organisation. This cannot be undone.`}
	action="?/deleteOrganisation"
	fields={{}}
	submitLabel="Delete organisation"
	confirmWord={organisation.name}
	bind:isOpen={isDeleteModalOpen}
/>
