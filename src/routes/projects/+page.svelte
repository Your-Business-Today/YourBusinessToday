<script lang="ts">
	import DangerConfirmModal from '$lib/components/site/DangerConfirmModal.svelte';
	import FlashMessage from '$lib/components/workspace/FlashMessage.svelte';
	import EditProjectForm from '$lib/components/projects/EditProjectForm.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import NewProjectForm from '$lib/components/projects/NewProjectForm.svelte';
	import PriorityModal from '$lib/components/site/PriorityModal.svelte';
	import ProjectBoard from '$lib/components/projects/ProjectBoard.svelte';
	import ProjectsPageHeader from '$lib/components/projects/ProjectsPageHeader.svelte';
	import TeamProjectsSection from '$lib/components/projects/TeamProjectsSection.svelte';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';
	import { ProjectListView } from '$lib/client/projectListView.svelte';
	import type { Project } from '$lib/server/projects/projectRecord';
	import type { ProjectSummary } from '$lib/server/projects/getProjectList';

	type PriorityChoice = { project: Project; among: string };

	let { data, form } = $props();

	let isNewProjectModalOpen = $state(false);
	let isEditModalOpen = $state(false);
	let isDeleteModalOpen = $state(false);
	let isPriorityModalOpen = $state(false);
	let selectedProject = $state<ProjectSummary | null>(null);
	let priorityChoice = $state<PriorityChoice | null>(null);

	const listView = new ProjectListView(() => data.projects);

	function openEditModal(project: ProjectSummary) {
		selectedProject = project;
		isEditModalOpen = true;
	}

	function openDeleteModal(project: ProjectSummary) {
		selectedProject = project;
		isDeleteModalOpen = true;
	}

	function openPriorityModal(project: Project, among: string) {
		priorityChoice = { project, among };
		isPriorityModalOpen = true;
	}
</script>

<svelte:head>
	<title>Projects — Your Business Today</title>
</svelte:head>

<ProjectsPageHeader onNewProject={() => (isNewProjectModalOpen = true)} />

<div class={workspaceBodyClasses}>
	<FlashMessage message={form?.message} />
	<ProjectBoard
		{listView}
		onEdit={openEditModal}
		onDelete={openDeleteModal}
		onSetPriority={(project) => openPriorityModal(project, 'of your board')}
	/>
	<TeamProjectsSection
		projects={data.teamProjects}
		onSetPriority={(project) => openPriorityModal(project, 'of your team projects')}
	/>
</div>

<Modal title="New project" bind:isOpen={isNewProjectModalOpen}>
	<NewProjectForm onCreated={() => (isNewProjectModalOpen = false)} />
</Modal>

{#if selectedProject !== null}
	<Modal title={`Edit ${selectedProject.name}`} bind:isOpen={isEditModalOpen}>
		<EditProjectForm project={selectedProject} onSaved={() => (isEditModalOpen = false)} />
	</Modal>
	<DangerConfirmModal
		title="Delete project"
		description={`This permanently deletes “${selectedProject.name}”, every task and subtask in it, and all their comments. This cannot be undone.`}
		action="?/deleteProject"
		fields={{ projectId: selectedProject.id }}
		submitLabel="Delete project"
		confirmWord={selectedProject.name}
		bind:isOpen={isDeleteModalOpen}
	/>
{/if}

{#if priorityChoice !== null}
	{@const rankedProject = priorityChoice.project}
	<PriorityModal
		itemName={rankedProject.name}
		priority={rankedProject.priority}
		among={priorityChoice.among}
		action="?/setProjectPriority"
		fields={{ projectId: rankedProject.id }}
		bind:isOpen={isPriorityModalOpen}
	/>
{/if}
