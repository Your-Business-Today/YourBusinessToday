<script lang="ts">
	import { page } from '$app/state';
	import EditProjectForm from './EditProjectForm.svelte';
	import KitVersionBadge from './KitVersionBadge.svelte';
	import HeaderFacts from '$lib/components/workspace/HeaderFacts.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import ProjectHeaderMenu from './ProjectHeaderMenu.svelte';
	import ProjectPageHeader from './ProjectPageHeader.svelte';
	import { headerPrimaryButtonClasses } from '$lib/components/workspace/workspaceStyles';
	import { organisationNameLookup } from '$lib/data/organisationNames';
	import { projectHeaderFacts } from '$lib/data/projectHeaderFacts';
	import type { Organisation } from '$lib/server/organisations/organisationRecord';
	import type { Project } from '$lib/server/projects/projectRecord';

	let {
		project,
		organisations,
		latestKitVersion,
		onAddTask
	}: {
		project: Project;
		organisations: Organisation[];
		latestKitVersion: string;
		onAddTask: () => void;
	} = $props();

	let isEditModalOpen = $state(false);

	const { framePicks } = $derived(page.data);
	const pickedOrganisationId = $derived(framePicks?.pickedOrganisationId ?? null);
	const organisationName = $derived(organisationNameLookup(organisations)(project.organisationId));
	const facts = $derived(projectHeaderFacts(project, { organisationName, pickedOrganisationId }));
</script>

<ProjectPageHeader {project}>
	{#snippet badges()}
		<a href="/projects/kit-versions" class="inline-flex rounded">
			<KitVersionBadge
				repositoryUrl={project.repositoryUrl}
				kitVersion={project.kitVersion}
				kitVersionReadAt={project.kitVersionReadAt}
				{latestKitVersion}
			/>
		</a>
	{/snippet}
	{#snippet actions()}
		<ProjectHeaderMenu {project} onEdit={() => (isEditModalOpen = true)} />
		<button type="button" onclick={onAddTask} class={headerPrimaryButtonClasses}>Add task</button>
	{/snippet}
	{#if project.description !== ''}
		<p class="line-clamp-2 max-w-4xl text-sm text-chalk-subtle">{project.description}</p>
	{/if}
	<HeaderFacts {facts} />
</ProjectPageHeader>

<Modal title={`Edit ${project.name}`} bind:isOpen={isEditModalOpen}>
	<EditProjectForm {project} {organisations} onSaved={() => (isEditModalOpen = false)} />
</Modal>
