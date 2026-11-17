<script lang="ts">
	import AssignProjectForm from './AssignProjectForm.svelte';
	import ClientProjectList from './ClientProjectList.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import { primaryButtonClasses } from '$lib/components/site/formStyles';
	import type { ClientProject } from '$lib/server/clients/getProjectsForClient';
	import type { UnassignedProject } from '$lib/server/projects/getUnassignedProjects';

	let { projects, unassignedProjects }: { projects: ClientProject[]; unassignedProjects: UnassignedProject[] } = $props();

	let isAssignProjectModalOpen = $state(false);
</script>

<section class="flex flex-col gap-4">
	<div class="flex items-center justify-between gap-4">
		<h2 class="font-display text-xl">Projects</h2>
		<button class={primaryButtonClasses} onclick={() => (isAssignProjectModalOpen = true)}>Add project</button>
	</div>
	{#if projects.length === 0}
		<p class="text-sm text-chalk/50">No projects yet — set this client on a project from its own page.</p>
	{:else}
		<ClientProjectList {projects} />
	{/if}
</section>

<Modal title="Add project" bind:isOpen={isAssignProjectModalOpen}>
	<AssignProjectForm projects={unassignedProjects} />
</Modal>
