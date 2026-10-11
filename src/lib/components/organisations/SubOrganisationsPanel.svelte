<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import NewOrganisationForm from './NewOrganisationForm.svelte';
	import { panelButtonClasses, panelEmptyClasses, panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { Organisation } from '$lib/server/organisations/organisationRecord';

	let {
		organisation,
		children,
		canManage
	}: { organisation: Organisation; children: Organisation[]; canManage: boolean } = $props();

	let isAddModalOpen = $state(false);
</script>

<DashboardPanel title="Sub-organisations" count={children.length}>
	{#snippet actions()}
		{#if canManage}
			<button type="button" onclick={() => (isAddModalOpen = true)} class={panelButtonClasses}>＋ Add</button>
		{/if}
	{/snippet}
	{#if children.length === 0}
		<p class={panelEmptyClasses}>
			No businesses under {organisation.name} yet. Add one when part of it is invoiced, or reached, on its own.
		</p>
	{:else}
		<ul class={panelListClasses}>
			{#each children as child (child.id)}
				<li class="px-4 py-2.5">
					<a href={`/organisations/${child.id}`} class="font-display text-sm transition hover:text-go">{child.name}</a>
				</li>
			{/each}
		</ul>
	{/if}
</DashboardPanel>

<Modal title={`New business of ${organisation.name}`} bind:isOpen={isAddModalOpen}>
	<NewOrganisationForm
		action="?/createSubOrganisation"
		parentName={organisation.name}
		onCreated={() => (isAddModalOpen = false)}
	/>
</Modal>
