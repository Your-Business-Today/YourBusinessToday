<script lang="ts">
	import DangerConfirmModal from '$lib/components/site/DangerConfirmModal.svelte';
	import FlashMessage from '$lib/components/workspace/FlashMessage.svelte';
	import OrganisationOverviewTabs from '$lib/components/organisations/OrganisationOverviewTabs.svelte';
	import OrganisationPageHeader from '$lib/components/organisations/OrganisationPageHeader.svelte';
	import { headerDangerButtonClasses, workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data, form } = $props();

	const { organisation } = $derived(data);

	let isDeleteModalOpen = $state(false);
</script>

<svelte:head>
	<title>{organisation.name} — Organisations — Your Business Today</title>
</svelte:head>

<OrganisationPageHeader {organisation}>
	{#snippet actions()}
		{#if data.isStaff}
			<button type="button" onclick={() => (isDeleteModalOpen = true)} class={headerDangerButtonClasses}>
				Delete
			</button>
		{/if}
	{/snippet}
	<p class="text-sm text-chalk-subtle">Everyone on {organisation.name} is on every project under it.</p>
</OrganisationPageHeader>

<div class={workspaceBodyClasses}>
	<FlashMessage message={form?.message} />
	<OrganisationOverviewTabs
		{organisation}
		projects={data.projects}
		members={data.members}
		modules={data.modules}
		directors={data.directors}
		canManage={data.canManage}
		isStaff={data.isStaff}
	/>
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
