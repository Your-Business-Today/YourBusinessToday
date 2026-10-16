<script lang="ts">
	import FlashMessage from '$lib/components/workspace/FlashMessage.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import NewProjectForm from '$lib/components/projects/NewProjectForm.svelte';
	import PriorityModal from '$lib/components/site/PriorityModal.svelte';
	import ProjectBoardTabs from '$lib/components/projects/ProjectBoardTabs.svelte';
	import ProjectEditModals from '$lib/components/projects/ProjectEditModals.svelte';
	import ProjectsPageHeader from '$lib/components/projects/ProjectsPageHeader.svelte';
	import WaitingOnYouSection from '$lib/components/projects/WaitingOnYouSection.svelte';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';
	import { ProjectListView } from '$lib/client/projectListView.svelte';
	import type { Project } from '$lib/server/projects/projectRecord';
	import type { ProjectSummary } from '$lib/server/projects/getProjectsForOwner';

	type PriorityChoice = { project: Project; among: string };

	let { data, form } = $props();

	let isNewProjectModalOpen = $state(false);
	let isEditModalOpen = $state(false);
	let isDeleteModalOpen = $state(false);
	let isPriorityModalOpen = $state(false);
	let selectedProject = $state<ProjectSummary | null>(null);
	let priorityChoice = $state<PriorityChoice | null>(null);

	const listView = new ProjectListView(() => data.projects, () => data.organisations);

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

<ProjectsPageHeader onNewProject={() => (isNewProjectModalOpen = true)} isAdmin={data.isAdmin} />

<div class={workspaceBodyClasses}>
	<FlashMessage message={form?.message} />
	<WaitingOnYouSection waitingTasks={data.waitingTasks} />
	<ProjectBoardTabs
		{listView}
		teamProjects={data.teamProjects}
		organisations={data.organisations}
		latestKitVersion={data.latestKitVersion}
		onEdit={openEditModal}
		onDelete={openDeleteModal}
		onSetPriority={(project) => openPriorityModal(project, 'of your board')}
		onSetTeamPriority={(project) => openPriorityModal(project, 'of your team projects')}
	/>
</div>

<Modal title="New project" bind:isOpen={isNewProjectModalOpen}>
	<NewProjectForm organisations={data.organisations} onCreated={() => (isNewProjectModalOpen = false)} />
</Modal>

{#if selectedProject !== null}
	<ProjectEditModals
		project={selectedProject}
		organisations={data.organisations}
		bind:isEditModalOpen
		bind:isDeleteModalOpen
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
