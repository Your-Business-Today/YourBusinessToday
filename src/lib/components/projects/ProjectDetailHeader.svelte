<script lang="ts">
	import EditProjectForm from './EditProjectForm.svelte';
	import KitVersionBadge from './KitVersionBadge.svelte';
	import HeaderFacts from '$lib/components/workspace/HeaderFacts.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import ProjectImagesButton from './ProjectImagesButton.svelte';
	import ProjectStatusBadge from './ProjectStatusBadge.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { headerButtonClasses, headerPrimaryButtonClasses } from '$lib/components/workspace/workspaceStyles';
	import { projectsCrumb } from '$lib/components/workspace/projectCrumbs';
	import { webAddressLabel } from '$lib/data/webAddressLabel';
	import type { Project } from '$lib/server/projects/projectRecord';
	import type { ProjectImage } from '$lib/server/projectImages/projectImageRecord';
	import type { TaskChoice } from '$lib/server/projects/openTaskChoices';

	let {
		project,
		cadenceLine,
		latestKitVersion,
		images,
		taskChoices,
		onAddTask
	}: {
		project: Project;
		cadenceLine: string;
		latestKitVersion: string;
		images: (ProjectImage & { uploaderName: string })[];
		taskChoices: TaskChoice[];
		onAddTask: () => void;
	} = $props();

	let isEditModalOpen = $state(false);

	const facts = $derived(
		[
			linkFact(project.repositoryUrl),
			linkFact(project.environmentUrl),
			project.repositoryUrl === '' ? null : { label: `⎇ ${project.defaultBranch}` },
			project.repositoryUrl === '' ? null : { label: cadenceLine }
		].filter((fact) => fact !== null)
	);

	function linkFact(webAddress: string) {
		if (webAddress === '') return null;
		return { label: webAddressLabel(webAddress), href: webAddress };
	}
</script>

<WorkspaceHeader crumbs={[projectsCrumb]} title={project.name}>
	{#snippet badge()}
		<ProjectStatusBadge status={project.status} />
		<a href="/projects/kit-versions" class="rounded-full">
			<KitVersionBadge
				repositoryUrl={project.repositoryUrl}
				kitVersion={project.kitVersion}
				{latestKitVersion}
			/>
		</a>
	{/snippet}
	{#snippet actions()}
		<button type="button" onclick={() => (isEditModalOpen = true)} class={headerButtonClasses}>
			Edit
		</button>
		<ProjectImagesButton {images} projectId={project.id} {taskChoices} />
		<button type="button" onclick={onAddTask} class={headerPrimaryButtonClasses}>Add task</button>
	{/snippet}
	{#if project.description !== ''}
		<p class="line-clamp-2 max-w-4xl text-sm text-chalk/70">{project.description}</p>
	{/if}
	<HeaderFacts {facts} />
</WorkspaceHeader>

<Modal title={`Edit ${project.name}`} bind:isOpen={isEditModalOpen}>
	<EditProjectForm {project} onSaved={() => (isEditModalOpen = false)} />
</Modal>
