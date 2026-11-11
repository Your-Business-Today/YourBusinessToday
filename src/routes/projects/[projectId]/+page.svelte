<script lang="ts">
	import FlashMessage from '$lib/components/workspace/FlashMessage.svelte';
	import ProjectDashboard from '$lib/components/projects/ProjectDashboard.svelte';
	import BoardSideSwitch from '$lib/components/projects/BoardSideSwitch.svelte';
	import DepartmentTabs from '$lib/components/projects/DepartmentTabs.svelte';
	import ScrumBoardPanel from '$lib/components/projects/scrumBoard/ScrumBoardPanel.svelte';
	import TabStrip from '$lib/components/workspace/TabStrip.svelte';
	import ProjectDetailHeader from '$lib/components/projects/ProjectDetailHeader.svelte';
	import ProjectNewTaskModal from '$lib/components/projects/ProjectNewTaskModal.svelte';
	import TaskRowModals from '$lib/components/projects/TaskRowModals.svelte';
	import TaskSheet from './TaskSheet.svelte';
	import { fade } from 'svelte/transition';
	import { tabSwap } from '$lib/client/motion';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';
	import { TaskRowDialogs } from '$lib/client/taskRowDialogs.svelte';
	import { RememberedChoice } from '$lib/client/rememberedChoice.svelte';
	import { developmentViewOrder, developmentViews, developmentViewStorageKey, developmentViewTabs } from '$lib/data/developmentView';
	import { boardSides } from '$lib/data/boardSide';
	import type { Department } from '$lib/data/department';
	import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

	let { data, form } = $props();

	const { project } = $derived(data);

	let isTaskModalOpen = $state(false);
	let subtaskParent = $state<TaskTreeNode | null>(null);
	let newItemDepartment = $state<Department | null>(null);
	const dialogs = new TaskRowDialogs();
	const isDevelopmentSide = $derived(data.boardSide === boardSides.development);
	const developmentView = new RememberedChoice(developmentViewStorageKey, developmentViews.backlog);
	developmentView.remember(developmentViewOrder);
	const isBoardChosen = $derived(developmentView.key === developmentViews.board);
	const scrumBoard = $derived(isDevelopmentSide && isBoardChosen ? data.scrumBoard : null);
	const newTaskSources = $derived({ ...data, department: newItemDepartment ?? data.department });

	function openNewTaskModal() {
		subtaskParent = null;
		newItemDepartment = null;
		isTaskModalOpen = true;
	}

	function openNewItemModal(department: Department) {
		subtaskParent = null;
		newItemDepartment = department;
		isTaskModalOpen = true;
	}

	function openSubtaskModal(parentTask: TaskTreeNode) {
		subtaskParent = parentTask;
		isTaskModalOpen = true;
	}
</script>

<svelte:head>
	<title>{project.name} — Projects — Your Business Today</title>
</svelte:head>

<ProjectDetailHeader
	{project}
	organisations={data.organisations}
	latestKitVersion={data.latestKitVersion}
	isInternalProject={data.isInternalProject}
	onAddTask={openNewTaskModal}
/>

<div class={workspaceBodyClasses}>
	<FlashMessage message={form?.message} />
	{#if !data.isInternalProject}
		<BoardSideSwitch sides={data.sideTabs} selected={data.boardSide} />
	{/if}
	{#if isDevelopmentSide}
		<TabStrip tabs={developmentViewTabs} bind:selectedKey={developmentView.key} />
	{/if}
	{#if scrumBoard !== null}
		<div in:fade={tabSwap}><ScrumBoardPanel board={scrumBoard} /></div>
	{:else}
		{#if isDevelopmentSide}
			<DepartmentTabs tabs={data.departmentTabs} selected={data.boardTab} />
		{/if}
		{#key data.boardTab}
			<div in:fade={tabSwap} class="flex flex-col gap-4">
				<ProjectDashboard
					projectId={project.id}
					sources={data}
					handlers={dialogs.handlersWith(openSubtaskModal)}
					onAddItem={openNewItemModal}
				/>
			</div>
		{/key}
	{/if}
</div>

<ProjectNewTaskModal bind:isOpen={isTaskModalOpen} parentTask={subtaskParent} sources={newTaskSources} />

<TaskRowModals {dialogs} goals={data.goals} canTurnOnAutocomplete={data.canTurnOnAutocomplete} />
<TaskSheet />
